from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Index

from app.database import Base


class PhotoAlbum(Base):
    __tablename__ = "photo_albums"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(String(500))
    cover_media_id = Column(Integer, ForeignKey("media.id", ondelete="SET NULL"))
    sort_order = Column(Integer, default=0)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_album_slug", "slug"),
        Index("idx_album_sort", "sort_order"),
    )
