from datetime import datetime

from pydantic import BaseModel, ConfigDict, HttpUrl


class ShortUrlCreate(BaseModel):
    original_url: HttpUrl
    custom_alias: str | None = None


class ShortUrlRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_url: str
    short_code: str
    clicks: int
    created_at: datetime
