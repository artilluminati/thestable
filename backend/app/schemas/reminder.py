from pydantic import BaseModel


class ReminderRead(BaseModel):
    path: str
    title: str
    schedule: dict
