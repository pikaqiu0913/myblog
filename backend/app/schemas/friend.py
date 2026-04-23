from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.schemas.media import MediaResponse


class FriendMemberResponse(BaseModel):
    id: int
    name: str
    category: str
    avatar: Optional[MediaResponse] = None
    bio_summary: Optional[str] = None
    sort_order: int = 0

    class Config:
        from_attributes = True


class FriendMemberDetailResponse(BaseModel):
    id: int
    name: str
    category: str
    avatar: Optional[MediaResponse] = None
    bio: Optional[str] = None
    bio_html: Optional[str] = None
    sort_order: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class FriendMemberCreate(BaseModel):
    name: str
    category: str
    avatar_media_id: Optional[int] = None
    bio: Optional[str] = None
    sort_order: int = 0
    is_public: bool = True


class FriendMemberUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    avatar_media_id: Optional[int] = None
    bio: Optional[str] = None
    sort_order: Optional[int] = None
    is_public: Optional[bool] = None
