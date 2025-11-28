from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class ChatSession(SQLModel, table=True):
    __tablename__ = "chat_sessions_new"
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True)
    user_id: str = Field(index=True)
    title: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages_new"
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True)
    role: str  # "user" or "assistant"
    content: str # JSON string or plain text
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Preference(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str
    key: str
    value: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)
