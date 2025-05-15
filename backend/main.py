
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import Gauge
from pydantic import BaseModel
import httpx
import json
import asyncio
from time import perf_counter


app = FastAPI()

# Vytvorte Gauge metriku pre počet použitých tokenov
token_usage_gauge = Gauge("ollama_token_usage_total", "Total number of tokens used in Ollama requests")

instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app)

# 🔧 CORS middleware
app.add_middleware(
    CORSMiddleware,
    # allow_origins=[
    #     "http://localhost:5173",
    #     "http://localhost:3000",
    # ],
    allow_origins=["*"],  # Povolené všetky zdroje
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

# URL pre jednotlivé enginy
OLLAMA_URL = "http://ollama:11434/api/generate"
# SGLANG_URL = "http://sglang:11434/api/generate"  # uprav podľa reality

class ChatRequest(BaseModel):
    prompt: str
    engine: str

@app.get("/")
async def root():
    return {"message": "BackendServer is running"}

@app.post("/api/chat")
async def chat(req: ChatRequest):
    personalities = {
        "professor": "You are a serious and thoughtful professor. Answer briefly and clearly, in 2-3 sentences.",
        "student": "You are a witty and curious student. Reply playfully and shortly, no more than 2 sentences."
    }

    dialogue = []
    total_tokens = 0

    current_message = f"{personalities['professor']}\nAnswer the following question:\n{req.prompt}"
    current_speaker = "Professor"

    for _ in range(5):
        payload = {
            "model": "llama3",
            "prompt": current_message,
            "stream": False
        }

        url = OLLAMA_URL if req.engine == "ollama" else SGLANG_URL
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload)
            data = response.json()
            reply = data["response"].strip()
            tokens_in_reply = len(reply.split())
            total_tokens += tokens_in_reply
            token_usage_gauge.inc(tokens_in_reply)

        dialogue.append({
            "agent": current_speaker,
            "response": reply,
            "tokens": tokens_in_reply
        })

        if current_speaker == "Professor":
            current_speaker = "Student"
            current_message = f"{personalities['student']}\nHere is what the professor said:\n\"{reply}\"\nNow respond to the professor."
        else:
            current_speaker = "Professor"
            current_message = f"{personalities['professor']}\nHere is what the student said:\n\"{reply}\"\nNow respond to the student."

    return {
        "reply": dialogue[-1]["response"],
        "dialogue": dialogue,
        "totalTokens": total_tokens
    }


@app.post("/api/chat-stream")
async def chat_stream(req: ChatRequest):
    async def event_generator():
        personalities = {
            "professor": "You are a serious and thoughtful professor. Answer briefly and clearly, in 2-3 sentences.",
            "student": "You are a witty and curious student. Reply playfully and shortly, no more than 2 sentences."
        }

        current_message = f"{personalities['professor']}\nAnswer the following question:\n{req.prompt}"
        current_speaker = "Professor"

        total_tokens = 0
        total_computation_cost = 0

        for _ in range(6):
            payload = {
                "model": "llama3",
                "prompt": current_message,
                "stream": True
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream("POST", OLLAMA_URL, json=payload) as response:
                    async for line in response.aiter_lines():
                        if line.strip():
                            try:
                                chunk = line.strip()
                                if chunk.startswith("data: "):
                                    chunk = chunk[6:]
                                data = json.loads(chunk)
                                token = data.get("response", "")

                                token_count = len(token.split())
                                total_tokens += token_count
                                total_computation_cost += token_count * 0.0001
                                token_usage_gauge.inc(token_count) # Zvýšte metriku

                                yield f'data: {json.dumps({"agent": current_speaker, "token": token, "tokensUsed": total_tokens, "computationDetails": f"Energy usage approx: {total_computation_cost} kWh"})}\n\n'
                                await asyncio.sleep(0.01)
                            except Exception as e:
                                print("Stream parsing error:", e)

            if current_speaker == "Professor":
                current_speaker = "Student"
                current_message = f"{personalities['student']}\nHere is what the professor said:\n\"{token}\"\nNow respond to the professor."
            else:
                current_speaker = "Professor"
                current_message = f"{personalities['professor']}\nHere is what the student said:\n\"{token}\"\nNow respond to the student."

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# Optional generic fallback
@app.post("/chat")  
async def generic_chat(request: ChatRequest):
    if request.engine == "ollama":
        return await chat(request)
    elif request.engine == "sglang":
        return await chat(request)  # Replace with `query_sglang` when implemented
    else:
        raise HTTPException(status_code=400, detail="Unknown engine")
    

@app.post("/api/compare")
async def compare_engines(req: ChatRequest):
    prompt = req.prompt

    # Spustenie Ollama
    start_ollama = perf_counter()
    ollama_result = await handle_ollama_chat(prompt)
    duration_ollama = perf_counter() - start_ollama

    # Spustenie SGLang
    start_sglang = perf_counter()
    sglang_result = await handle_sglang_chat(prompt)
    duration_sglang = perf_counter() - start_sglang

    return {
        "prompt": prompt,
        "ollama": {
            "reply": ollama_result["reply"],
            "tokens": ollama_result["totalTokens"],
            "time_sec": round(duration_ollama, 2)
        },
        "sglang": {
            "reply": sglang_result["reply"],
            "tokens": sglang_result["totalTokens"],
            "time_sec": round(duration_sglang, 2)
        }
    }