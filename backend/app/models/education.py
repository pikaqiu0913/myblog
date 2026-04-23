from datetime import datetime, date

from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Boolean, Index

from app.database import Base


class Education(Base):
    __tablename__ = "education"

    id = Column(Integer, primary_key=True, autoincrement=True)
    school_name = Column(String(200), nullable=False)
    major = Column(String(100))
    degree = Column(String(50))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    is_current = Column(Boolean, default=False)
    description = Column(Text)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_edu_sort", "sort_order"),
    )
