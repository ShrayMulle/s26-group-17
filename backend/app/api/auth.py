from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        name=user_data.name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and get JWT token"""
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current logged-in user"""
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.post("/ai/generate")
async def generate_notes(request: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    import httpx
    import os
    
    response = httpx.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": os.getenv("ANTHROPIC_API_KEY"),
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-sonnet-4-6",
            "max_tokens": 1000,
            "messages": [{"role": "user", "content": request["prompt"]}],
        },
        timeout=30,
    )
    return response.json()


@router.get("/nu/courses")
async def search_neu_courses(subject: str, course_number: str = "", term: str = "202630"):
    import httpx
    async with httpx.AsyncClient(follow_redirects=True) as client:
        # Step 1: declare term to get session cookies
        await client.post(
            "https://nubanner.neu.edu/StudentRegistrationSsb/ssb/term/search?mode=search",
            data={"term": term},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        # Step 2: search with same session (cookies persist)
        url = f"https://nubanner.neu.edu/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject={subject.upper()}&txt_term={term}&startDatepicker=&endDatepicker=&pageOffset=0&pageMaxSize=500&sortColumn=subjectDescription&sortDirection=asc"
        res = await client.get(url)
        data = res.json()
        # Filter by course number client-side since Banner ignores txt_courseNumber
        if course_number and data.get("data"):
            data["data"] = [c for c in data["data"] if str(c.get("courseNumber", "")).startswith(str(course_number))]
            data["totalCount"] = len(data["data"])
        return data
