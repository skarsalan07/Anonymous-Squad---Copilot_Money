from fastapi import APIRouter, HTTPException
from fastapi import Depends
from app.schemas import CreateSessionReq, CreateSessionResp, ChatMessageReq, ChatMessageResp
from app.models import ChatSession, Preference
from app.db import engine
from sqlmodel import Session, select
import uuid
from app.groq_client import ask_groq
from app.utils import extract_ticker_from_text
from datetime import datetime

router = APIRouter()

@router.post("/sessions", response_model=CreateSessionResp)
def create_session(req: CreateSessionReq):
    session_id = str(uuid.uuid4())
    with Session(engine) as db:
        sess = ChatSession(session_id=session_id, title=req.title)
        db.add(sess)
        db.commit()
    return {"session_id": session_id}

@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResp)
def send_message(session_id: str, req: ChatMessageReq):
    # Basic session validation
    with Session(engine) as db:
        q = select(ChatSession).where(ChatSession.session_id == session_id)
        res = db.exec(q).first()
        if not res:
            raise HTTPException(status_code=404, detail="Session not found")

    # Build prompt for Groq
    prompt = f"""
You are an expert trading assistant. User message: "{req.content}"
Return a helpful human-readable reply. Additionally, if the user's message references a stock ticker or requests news/chart, include metadata JSON with keys:
- news: {{ "ticker": "AAPL" }} or null
- chart: {{ "ticker": "AAPL" }} or null

Return a JSON object (only) for the metadata after your assistant text, separated with a line like: ---METADATA--- followed by JSON.
"""
    resp = ask_groq(prompt)
    content = resp["content"]

    # Try to split assistant text and metadata block
    assistant_text = content
    metadata = {}
    if '---METADATA---' in content:
        parts = content.split('---METADATA---', 1)
        assistant_text = parts[0].strip()
        try:
            import json
            metadata = json.loads(parts[1].strip())
        except Exception:
            metadata = {}
    else:
        # fallback: attempt to detect ticker via simple extraction
        t = extract_ticker_from_text(req.content)
        if t:
            metadata = {"news": {"ticker": t}, "chart": {"ticker": t}}
        else:
            metadata = {}

    # return a small id (timestamp)
    return {"id": int(datetime.utcnow().timestamp()), "content": assistant_text, "metadata": metadata}
