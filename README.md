# 📚 StudyQuest

A collaborative study task management platform built for Oasis NEU Spring 2026.

## ✨ Features

- 🗂️ **Multiple Course Boards** — create a Kanban board per course
- ✅ **Task Management** — add, edit, delete, and drag tasks between columns
- ⭐ **XP System** — earn XP by completing tasks, level up as you progress
- 📊 **Analytics Dashboard** — charts showing completion rate and XP progress
- 🏆 **Team Leaderboard** — see who has the most XP on the team
- 🔄 **Real-time Sync** — changes appear instantly for all teammates via WebSockets
- 🎉 **Confetti & Level Up** — celebrations when you complete tasks or level up

## 🛠️ Tech Stack

**Frontend:** React + TypeScript + Vite + Tailwind CSS + Supabase Auth

**Backend:** FastAPI + SQLite + SQLAlchemy + JWT Auth

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20 (install via `brew install node@20`)
- Python 3.11+

### 1. Clone the repo
```bash
git clone https://github.com/Oasis-NEU/s26-group-17.git
cd s26-group-17
```

### 2. Set up the frontend
```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
npm install
```

Create a `.env` file in the root:
```
VITE_SUPABASE_URL=https://xiyvsxzcriuxolmqesfu.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpeXZzeHpjcml1eG9sbXFlc2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODI1MzcsImV4cCI6MjA4OTE1ODUzN30.GEYQXl3TViWSSZnvCW6yyCsbrkNkiE4sDl6py644T4w
```

### 3. Set up the backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `backend/.env` file:
```
DATABASE_URL=sqlite:///./studyquest.db
JWT_SECRET=your-super-secret-key-change-this-later
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. Run the app

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
npm run dev
```

Visit **http://localhost:5173** and sign up!

---

## 👥 Team

- **Shray** — Backend API, XP system, Analytics, Real-time sync
- **Sammy** — Login UI, Supabase Auth
- **Sean** — Frontend components

What we can do next is implement the Nubanner ApI- with said things implemented: 
List Semesters
Search for Semesters
Reset data form
Restrictions
