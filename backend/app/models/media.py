from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Index, BigInteger

from app.database import Base


class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, autoincrement=True)
    original_name = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_url = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    width = Column(Integer)
    height = Column(Integer)
    alt_text = Column(String(255))
    description = Column(String(500))
    module_type = Column(String(50), nullable=False)
    ref_id = Column(Integer)
    is_public = Column(Boolean, default=True)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_media_module", "module_type", "ref_id"),
        Index("idx_media_mime", "mime_type"),
    )
