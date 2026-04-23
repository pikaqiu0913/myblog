from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Index

from app.database import Base


class FriendPhoto(Base):
    __tablename__ = "friend_photos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String(50), nullable=False, comment="分类: high_school/undergraduate/internship")
    media_id = Column(Integer, ForeignKey("media.id", ondelete="CASCADE"), nullable=False)
    caption = Column(String(255), comment="照片说明")
    sort_order = Column(Integer, default=0)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_fp_category", "category"),
        Index("idx_fp_sort", "sort_order"),
    )
