from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from app.database import Base


class SiteConfig(Base):
    __tablename__ = "site_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    config_key = Column(String(100), unique=True, nullable=False)
    config_value = Column(String(2000), nullable=False)  # JSON string
    description = Column(String(255))
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
