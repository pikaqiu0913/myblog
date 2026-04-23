from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Index

from app.database import Base


class FriendMember(Base):
    __tablename__ = "friend_members"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, comment="姓名")
    category = Column(String(50), nullable=False, comment="分类: high_school/undergraduate/internship")
    avatar_media_id = Column(Integer, ForeignKey("media.id", ondelete="SET NULL"), comment="头像照片")
    bio = Column(Text, comment="简介（Markdown）")
    bio_html = Column(Text, comment="渲染后的 HTML")
    sort_order = Column(Integer, default=0)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_fm_category", "category"),
        Index("idx_fm_sort", "sort_order"),
    )
