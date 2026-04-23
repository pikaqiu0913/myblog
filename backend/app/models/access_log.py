from datetime import datetime

from sqlalchemy import Column, BigInteger, String, Integer, Boolean, DateTime, Index, Text

from app.database import Base


class AccessLog(Base):
    __tablename__ = "access_logs"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    ip_address = Column(String(45), nullable=False)
    user_agent = Column(String(500))
    request_path = Column(String(500), nullable=False)
    request_method = Column(String(10), nullable=False)
    response_status = Column(Integer)
    request_headers = Column(Text)  # JSON string
    fingerprint = Column(String(64))
    is_suspected_bot = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_alog_ip_created", "ip_address", "created_at"),
        Index("idx_alog_fingerprint", "fingerprint"),
        Index("idx_alog_created", "created_at"),
        Index("idx_alog_bot", "is_suspected_bot", "created_at"),
    )
