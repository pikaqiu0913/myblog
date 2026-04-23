from datetime import datetime, date

from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Boolean, ForeignKey, Index

from app.database import Base


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    relation = Column(String(50), nullable=False)
    avatar_media_id = Column(Integer, ForeignKey("media.id", ondelete="SET NULL"))
    bio = Column(Text)
    bio_html = Column(Text)
    birth_date = Column(Date)
    hobbies = Column(String(500))  # JSON string
    sort_order = Column(Integer, default=0)
    is_public = Column(Boolean, default=True)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_fm_relation", "relation"),
        Index("idx_fm_sort", "sort_order"),
    )
