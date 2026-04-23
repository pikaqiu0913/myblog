from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class GuestbookMessageResponse(BaseModel):
    id: int
    nickname: str
    content: str
    contact: Optional[str] = None
    is_public: bool = True
    created_at: datetime

    class Config:
        from_attributes = True


class GuestbookMessageCreate(BaseModel):
    nickname: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1, max_length=2000)
    contact: Optional[str] = Field(None, max_length=255)


class GuestbookMessageUpdate(BaseModel):
    is_public: Optional[bool] = None
