from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class MediaResponse(BaseModel):
    id: int
    original_name: str
    file_name: str
    file_url: str
    mime_type: str
    file_size: int
    width: Optional[int] = None
    height: Optional[int] = None
    alt_text: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MediaUploadResponse(BaseModel):
    media: MediaResponse
    signed_url: str
