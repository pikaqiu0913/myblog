from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Index

from app.database import Base


class BotBlock(Base):
    __tablename__ = "bot_blocks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ip_address = Column(String(45), nullable=False)
    fingerprint = Column(String(64))
    block_reason = Column(String(50), nullable=False)
    evidence = Column(String(2000))  # JSON string
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_bb_ip", "ip_address"),
        Index("idx_bb_expires", "expires_at"),
    )
