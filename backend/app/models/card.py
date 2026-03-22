from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from datetime import datetime
import uuid
from app.core.database import Base

class Card(Base):
    __tablename__ = "cards"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    board_id = Column(String, ForeignKey("boards.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    column = Column(String(50), nullable=False, default="todo")
    position = Column(Integer, nullable=False, default=0)
    due_date = Column(DateTime, nullable=True)
    xp_value = Column(Integer, nullable=False, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
