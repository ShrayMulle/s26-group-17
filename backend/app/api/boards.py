from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.board import Board
from app.models.user import User as UserModel
from app.models.card import Card
from app.schemas.board import BoardCreate, BoardResponse, CardCreate, CardUpdate, CardMove, CardResponse

from app.core.websocket import manager
import asyncio

router = APIRouter(prefix="/boards", tags=["boards"])
cards_router = APIRouter(prefix="/cards", tags=["cards"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("", response_model=List[BoardResponse])
def get_boards(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Board).filter(Board.user_id == current_user.id).all()

@router.post("", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
def create_board(board_data: BoardCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    board = Board(user_id=current_user.id, name=board_data.name, course_name=board_data.course_name)
    db.add(board)
    db.commit()
    db.refresh(board)
    return board

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    """Get all users ranked by XP"""
    users = db.query(UserModel).all()
    leaderboard = []
    for user in users:
        boards = db.query(Board).filter(Board.user_id == user.id).all()
        total_xp = 0
        total_done = 0
        for board in boards:
            done_cards = db.query(Card).filter(Card.board_id == board.id, Card.column == "done").all()
            total_xp += sum(c.xp_value for c in done_cards)
            total_done += len(done_cards)
        leaderboard.append({"id": user.id, "name": user.name, "xp": total_xp, "completed": total_done})
    leaderboard.sort(key=lambda x: x["xp"], reverse=True)
    return leaderboard

@router.get("/{board_id}", response_model=BoardResponse)
def get_board(board_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id, Board.user_id == current_user.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board

@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(board_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id, Board.user_id == current_user.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    db.delete(board)
    db.commit()

@cards_router.get("", response_model=List[CardResponse])
def get_cards(board_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id, Board.user_id == current_user.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return db.query(Card).filter(Card.board_id == board_id).order_by(Card.position).all()

@cards_router.post("", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
async def create_card(card_data: CardCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == card_data.board_id, Board.user_id == current_user.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    card = Card(**card_data.model_dump())
    db.add(card)
    db.commit()
    db.refresh(card)
    asyncio.create_task(manager.broadcast({"type": "card_created", "board_id": card.board_id}))
    return card

@cards_router.put("/{card_id}", response_model=CardResponse)
async def update_card(card_id: str, card_data: CardUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = db.query(Card).join(Board).filter(Card.id == card_id, Board.user_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    for key, value in card_data.model_dump(exclude_unset=True).items():
        setattr(card, key, value)
    db.commit()
    db.refresh(card)
    return card

@cards_router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(card_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = db.query(Card).join(Board).filter(Card.id == card_id, Board.user_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    board_id = card.board_id
    db.delete(card)
    db.commit()
    asyncio.create_task(manager.broadcast({"type": "card_deleted", "board_id": board_id}))

@cards_router.patch("/{card_id}/move", response_model=CardResponse)
async def move_card(card_id: str, move_data: CardMove, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = db.query(Card).join(Board).filter(Card.id == card_id, Board.user_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    card.column = move_data.column
    card.position = move_data.position
    db.commit()
    db.refresh(card)
    asyncio.create_task(manager.broadcast({"type": "card_moved", "board_id": card.board_id}))
    return card


from app.models.user import User as UserModel

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    """Get all users ranked by XP (cards in done column)"""
    users = db.query(UserModel).all()
    leaderboard = []
    for user in users:
        boards = db.query(Board).filter(Board.user_id == user.id).all()
        total_xp = 0
        total_done = 0
        for board in boards:
            done_cards = db.query(Card).filter(
                Card.board_id == board.id,
                Card.column == 'done'
            ).all()
            total_xp += sum(c.xp_value for c in done_cards)
            total_done += len(done_cards)
        leaderboard.append({
            "id": user.id,
            "name": user.name,
            "xp": total_xp,
            "completed": total_done,
        })
    leaderboard.sort(key=lambda x: x["xp"], reverse=True)
    return leaderboard
