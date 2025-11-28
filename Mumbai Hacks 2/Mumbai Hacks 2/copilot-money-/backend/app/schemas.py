from pydantic import BaseModel
from typing import Optional, Any, List

class CreateSessionReq(BaseModel):
    title: Optional[str] = "New Chat Session"

class CreateSessionResp(BaseModel):
    session_id: str

class ChatMessageReq(BaseModel):
    content: str

class ChatMessageResp(BaseModel):
    id: int
    content: str
    metadata: Optional[Any] = None

class PreferenceQuestion(BaseModel):
    id: str
    question: str
    type: str
    options: List[dict]

class SavePreferencesReq(BaseModel):
    session_id: str
    prefs: dict

