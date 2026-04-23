from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Index

from app.database import Base


class GuestbookMessage(Base):
    __tablename__ = "guestbook_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nickname = Column(String(100), nullable=False, comment="昵称")
    content = Column(Text, nullable=False, comment="留言内容")
    contact = Column(String(255), comment="联系方式（可选）")
    ip_address = Column(String(45), comment="IP 地址")
    fingerprint = Column(String(64), comment="浏览器指纹")
    is_public = Column(Boolean, default=True, comment="是否展示")
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_gb_public", "is_public", "created_at"),
        Index("idx_gb_ip", "ip_address", "created_at"),
    )
