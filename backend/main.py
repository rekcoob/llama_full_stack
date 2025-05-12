
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import Gauge
from pydantic import BaseModel
import httpx
import json
import asyncio

app = FastAPI()

# Vytvorte Gauge metriku pre počet použitých tokenov
token_usage_gauge = Gauge("ollama_token_usage_total", "Total number of tokens used in Ollama requests")

instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app)

# 🔧 CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://ollama:11434/api/generate"

class ChatRequest(BaseModel):
    prompt: str  

@app.get("/")
async def root():
    return {"message": "Backend is running"}

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

    for i in range(5):
        payload = {
            "model": "llama3",
            "prompt": current_message,
            "stream": False
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            data = response.json()
            reply = data["response"].strip()
            tokens_in_reply = len(reply.split()) # Jednoduchý odhad
            total_tokens += tokens_in_reply
            token_usage_gauge.inc(tokens_in_reply) # Zvýšte metriku

        dialogue.append({"agent": current_speaker, "response": reply, "tokens": tokens_in_reply})

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
