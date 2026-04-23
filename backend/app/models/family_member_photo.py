from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index

from app.database import Base


class FamilyMemberPhoto(Base):
    __tablename__ = "family_member_photos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    family_member_id = Column(Integer, ForeignKey("family_members.id", ondelete="CASCADE"), nullable=False)
    media_id = Column(Integer, nullable=False)
    caption = Column(String(255))
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_fmp_member", "family_member_id"),
        Index("idx_fmp_sort", "sort_order"),
    )
