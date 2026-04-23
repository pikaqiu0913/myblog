from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

from app.schemas.media import MediaResponse


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    sort_order: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None


class ArticleResponse(BaseModel):
    id: int
    title: str
    slug: str
    summary: Optional[str] = None
    content: Optional[str] = None
    html_content: Optional[str] = None
    cover: Optional[MediaResponse] = None
    category: Optional[CategoryResponse] = None
    author_id: Optional[int] = None
    status: str = "draft"
    view_count: int = 0
    is_top: bool = False
    meta_keywords: Optional[str] = None
    meta_description: Optional[str] = None
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ArticleListResponse(BaseModel):
    id: int
    title: str
    slug: str
    summary: Optional[str] = None
    cover: Optional[MediaResponse] = None
    category: Optional[CategoryResponse] = None
    view_count: int = 0
    is_top: bool = False
    published_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ArticleCreate(BaseModel):
    title: str
    slug: str
    summary: Optional[str] = None
    content: str
    cover_media_id: Optional[int] = None
    category_id: Optional[int] = None
    status: str = "draft"
    is_top: bool = False
    meta_keywords: Optional[str] = None
    meta_description: Optional[str] = None
    published_at: Optional[datetime] = None


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    cover_media_id: Optional[int] = None
    category_id: Optional[int] = None
    status: Optional[str] = None
    is_top: Optional[bool] = None
    meta_keywords: Optional[str] = None
    meta_description: Optional[str] = None
    published_at: Optional[datetime] = None
