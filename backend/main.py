from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI()

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
    personality: str  # Nový parameter pre výber osobnosti

@app.get("/")
async def root():
    return {"message": "Backend is running"}

# @app.post("/chat")
@app.post("/api/chat")
async def chat(req: ChatRequest):
    # Mapovanie osobností na preddefinované prompt správy
    personalities = {
        "professor": "Odpovedz na túto otázku ako profesor na univerzite.",
        "friend": "Odpovedz na túto otázku priateľsky a neformálne.",
        "jokester": "Odpovedz na túto otázku s humorom a vtipom.",
        "assistant": "Odpovedz na túto otázku ako asistent s užitočnými radami."
    }
    # Získať prompt pre vybranú osobnosť
    personality_prompt = personalities.get(req.personality, "Odpovedz na túto otázku neutrálne.")
    
    # Kombinuj pôvodný prompt s osobnostným promptom
    combined_prompt = f"{personality_prompt} {req.prompt}"

    payload = {
        "model": "llama3",  # alebo iný model nainštalovaný cez Ollama
        "prompt": combined_prompt,
        "stream": False
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(OLLAMA_URL, json=payload)
        # return response.json()

        data = response.json()
        return { "reply": data["response"] } 
