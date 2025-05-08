from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI()

# 🔧 CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend adresa
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

# @app.post("/chat")
@app.post("/api/chat")
async def chat(req: ChatRequest):
    payload = {
        "model": "llama3",  # alebo iný model nainštalovaný cez Ollama
        "prompt": req.prompt,
        "stream": False
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(OLLAMA_URL, json=payload)
        return response.json()
