# FastAPI app + /chat endpoint
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from query import ask
from contextlib import asynccontextmanager
import os, chromadb

@asynccontextmanager
async def lifespan(app: FastAPI):
    chroma_path = os.getenv("CHROMA_PATH", "../chroma_db")
    client = chromadb.PersistentClient(path=chroma_path)
    collections = client.list_collections()
    if not any(c.name == "football" for c in collections):
        print("No DB found — running ingest...")
        from ingest import build_index
        build_index()
    yield

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ChatRequest(BaseModel):
    question: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/chat")
def chat(req: ChatRequest):
    result = ask(req.question)
    return result