from datetime import datetime

from pydantic import BaseModel, Field


class NoteSummary(BaseModel):
    path: str
    title: str
    updated_at: datetime


class NoteRead(BaseModel):
    path: str
    title: str
    content: str
    outbound_links: list[str] = Field(default_factory=list)
    updated_at: datetime


class NoteCreate(BaseModel):
    path: str
    content: str = ""


class NoteUpdate(BaseModel):
    content: str
