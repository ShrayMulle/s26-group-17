from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth
from app.api.boards import router as boards_router, cards_router
from app.core.database import engine, Base
from app.core.websocket import manager
from app.models import user, board, card

Base.metadata.create_all(bind=engine)

app = FastAPI(title="StudyQuest API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "https://cosmic-donut-cf29e5.netlify.app", "https://*.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(boards_router)
app.include_router(cards_router)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def root():
    return {"message": "StudyQuest API is running!", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
