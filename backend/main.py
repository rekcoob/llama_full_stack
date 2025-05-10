from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import BaseModel
import httpx

app = FastAPI()
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

    # Začiatočný vstup od používateľa → ide ako otázka pre profesora
    current_message = f"{personalities['professor']}\nAnswer the following question:\n{req.prompt}"
    current_speaker = "Professor"

    for i in range(5):  # 🔁 5 kôl dialógu
        payload = {
            "model": "llama3",
            "prompt": current_message,
            "stream": False
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            reply = response.json()["response"].strip()

        dialogue.append({"agent": current_speaker, "response": reply})

        # Priprav ďalšie kolo
        if current_speaker == "Professor":
            current_speaker = "Student"
            current_message = f"{personalities['student']}\nHere is what the professor said:\n\"{reply}\"\nNow respond to the professor."
        else:
            current_speaker = "Professor"
            current_message = f"{personalities['professor']}\nHere is what the student said:\n\"{reply}\"\nNow respond to the student."

    # return { "dialogue": dialogue }
    return {
        "reply": dialogue[-1]["response"],
        "dialogue": dialogue
    }