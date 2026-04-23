from datetime import datetime, date

from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Boolean, ForeignKey

from app.database import Base


class Profile(Base):
    __tablename__ = "profile"

    id = Column(Integer, primary_key=True, autoincrement=True)
    real_name = Column(String(100), nullable=False)
    nick_name = Column(String(100))
    motto = Column(String(255))
    bio = Column(Text)
    bio_html = Column(Text)
    birth_date = Column(Date)
    location = Column(String(200))
    email_public = Column(String(255))
    phone_public = Column(String(50))
    github_url = Column(String(500))
    linkedin_url = Column(String(500))
    wechat_qr_url = Column(String(500))
    avatar_media_id = Column(Integer, ForeignKey("media.id", ondelete="SET NULL"))
    resume_url = Column(String(500))
    is_public = Column(Boolean, default=True)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
