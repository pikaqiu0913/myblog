from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Index

from app.database import Base


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    summary = Column(String(500))
    content = Column(Text, nullable=False)
    html_content = Column(Text)
    cover_media_id = Column(Integer, ForeignKey("media.id", ondelete="SET NULL"))
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"))
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    status = Column(String(20), default="draft")
    view_count = Column(Integer, default=0)
    is_top = Column(Boolean, default=False)
    meta_keywords = Column(String(255))
    meta_description = Column(String(255))
    published_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_art_slug", "slug"),
        Index("idx_art_status_pub", "status", "published_at"),
        Index("idx_art_category", "category_id"),
    )
