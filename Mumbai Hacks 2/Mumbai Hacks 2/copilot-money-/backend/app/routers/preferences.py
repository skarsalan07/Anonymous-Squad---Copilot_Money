from fastapi import APIRouter, HTTPException
from app.schemas import PreferenceQuestion, SavePreferencesReq
from app.db import engine
from app.models import Preference
from sqlmodel import Session, select
from typing import List
from datetime import datetime

router = APIRouter()

# Static questions - change as you like
# Static questions for the interview flow
QUESTIONS = [
    {
        "id": "goal",
        "question": "What is your primary investment goal?",
        "type": "select",
        "options": [
            {"value": "growth", "label": "Aggressive Growth (Max returns, high risk)"},
            {"value": "balanced", "label": "Balanced (Growth + Income)"},
            {"value": "income", "label": "Income Generation (Dividends)"},
            {"value": "preservation", "label": "Capital Preservation (Safety first)"}
        ]
    },
    {
        "id": "risk_tolerance",
        "question": "How do you handle market drops?",
        "type": "select",
        "options": [
            {"value": "low", "label": "Panic & Sell (Low Risk Tolerance)"},
            {"value": "medium", "label": "Wait it out (Medium Risk Tolerance)"},
            {"value": "high", "label": "Buy more! (High Risk Tolerance)"}
        ]
    },
    {
        "id": "horizon",
        "question": "How long do you plan to hold these investments?",
        "type": "select",
        "options": [
            {"value": "short", "label": "Less than 1 year"},
            {"value": "medium", "label": "1 - 5 years"},
            {"value": "long", "label": "5+ years"}
        ]
    },
    {
        "id": "amount",
        "question": "What is your initial investment amount?",
        "type": "select",
        "options": [
            {"value": "small", "label": "Under $1,000"},
            {"value": "medium", "label": "$1,000 - $10,000"},
            {"value": "large", "label": "$10,000 - $50,000"},
            {"value": "xl", "label": "$50,000+"}
        ]
    },
    {
        "id": "sectors",
        "question": "Which sectors interest you the most?",
        "type": "multi-select",
        "options": [
            {"value": "tech", "label": "Technology & AI"},
            {"value": "finance", "label": "Finance & Banking"},
            {"value": "healthcare", "label": "Healthcare & Biotech"},
            {"value": "energy", "label": "Energy & Green Tech"},
            {"value": "consumer", "label": "Consumer Goods"},
            {"value": "real_estate", "label": "Real Estate"}
        ]
    },
    {
        "id": "region",
        "question": "Do you have a regional preference?",
        "type": "select",
        "options": [
            {"value": "us", "label": "US Market Only"},
            {"value": "global", "label": "Global / International"},
            {"value": "emerging", "label": "Emerging Markets"}
        ]
    },
    {
        "id": "strategy",
        "question": "What is your preferred investment strategy?",
        "type": "select",
        "options": [
            {"value": "value", "label": "Value Investing (Undervalued stocks)"},
            {"value": "growth", "label": "Growth Investing (High potential)"},
            {"value": "dividend", "label": "Dividend Growth"},
            {"value": "momentum", "label": "Momentum Trading"}
        ]
    },
    {
        "id": "experience",
        "question": "How would you rate your investment experience?",
        "type": "select",
        "options": [
            {"value": "beginner", "label": "Beginner"},
            {"value": "intermediate", "label": "Intermediate"},
            {"value": "advanced", "label": "Advanced"}
        ]
    }
]

@router.get("/questions")
def get_questions():
    return {"questions": QUESTIONS}

@router.post("/")
def save_preferences(payload: dict):
    # expecting session_id and other preferences in body
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(400, "session_id required")
    with Session(engine) as db:
        # Save each key/value as a Preference
        for k, v in payload.items():
            if k == "session_id":
                continue
            q = select(Preference).where(Preference.session_id == session_id, Preference.key == k)
            existing = db.exec(q).first()
            if existing:
                existing.value = str(v)
                existing.updated_at = datetime.utcnow()
                db.add(existing)
            else:
                p = Preference(session_id=session_id, key=k, value=str(v))
                db.add(p)
        db.commit()
    return {"status": "ok"}

@router.get("/{session_id}")
def get_preferences(session_id: str):
    with Session(engine) as db:
        q = select(Preference).where(Preference.session_id == session_id)
        prefs = db.exec(q).all()
        if not prefs:
            # return 404 to match frontend check logic
            raise HTTPException(404, "No preferences")
        out = {p.key: p.value for p in prefs}
        return out
