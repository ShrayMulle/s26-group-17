from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class BoardCreate(BaseModel):
    name: str
    course_name: Optional[str] = None

class BoardResponse(BaseModel):
    id: str
    user_id: str
    name: str
    course_name: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class CardCreate(BaseModel):
    board_id: str
    title: str
    description: Optional[str] = None
    column: str = "todo"
    position: int = 0
    due_date: Optional[datetime] = None
    xp_value: int = 10

class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    column: Optional[str] = None
    position: Optional[int] = None
    due_date: Optional[datetime] = None
    xp_value: Optional[int] = None

class CardMove(BaseModel):
    column: str
    position: int

class CardResponse(BaseModel):
    id: str
    board_id: str
    title: str
    description: Optional[str]
    column: str
    position: int
    due_date: Optional[datetime]
    xp_value: int
    created_at: datetime
    class Config:
        from_attributes = True
