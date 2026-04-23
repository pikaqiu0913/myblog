from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel

from app.schemas.media import MediaResponse


class EducationResponse(BaseModel):
    id: int
    school_name: str
    major: Optional[str] = None
    degree: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None
    sort_order: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EducationCreate(BaseModel):
    school_name: str
    major: Optional[str] = None
    degree: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None
    sort_order: int = 0


class EducationUpdate(BaseModel):
    school_name: Optional[str] = None
    major: Optional[str] = None
    degree: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None


class PhotoAlbumResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    cover: Optional[MediaResponse] = None
    sort_order: int = 0
    is_public: bool = True
    created_at: datetime

    class Config:
        from_attributes = True


class PhotoAlbumCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    cover_media_id: Optional[int] = None
    sort_order: int = 0
    is_public: bool = True


class PhotoAlbumUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    cover_media_id: Optional[int] = None
    sort_order: Optional[int] = None
    is_public: Optional[bool] = None


class ProfileResponse(BaseModel):
    id: int
    real_name: str
    nick_name: Optional[str] = None
    motto: Optional[str] = None
    bio: Optional[str] = None
    bio_html: Optional[str] = None
    birth_date: Optional[date] = None
    location: Optional[str] = None
    email_public: Optional[str] = None
    phone_public: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    wechat_qr_url: Optional[str] = None
    avatar: Optional[MediaResponse] = None
    resume_url: Optional[str] = None
    is_public: bool = True
    view_count: int = 0

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    real_name: Optional[str] = None
    nick_name: Optional[str] = None
    motto: Optional[str] = None
    bio: Optional[str] = None
    birth_date: Optional[date] = None
    location: Optional[str] = None
    email_public: Optional[str] = None
    phone_public: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    wechat_qr_url: Optional[str] = None
    avatar_media_id: Optional[int] = None
    resume_url: Optional[str] = None
    is_public: Optional[bool] = None
