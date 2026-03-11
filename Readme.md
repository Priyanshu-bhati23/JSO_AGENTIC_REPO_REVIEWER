# JSO Code Portfolio Evaluation Agent
### JSO Phase-2 — Agentic Career Intelligence Development

An AI-powered GitHub repository evaluation system built for the JSO recruitment platform. Submit any GitHub repository and receive a structured technical assessment with scores, strengths, and improvement recommendations — designed to help HR Consultants evaluate technical candidates fairly and efficiently.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://agentic-frontend-deploy-ow3mp4e9j-priyanshu-bhati23s-projects.vercel.app |
| Backend API | https://fallguy23-agetic-jso.hf.space |
| API Docs | https://fallguy23-agetic-jso.hf.space/docs |

---

## 📁 Project Structure

```
JSO_AGENTIC_REPO_REVIEWER/
│
├── backend/                        ← Deployed on HuggingFace Spaces
│   ├── agent.py                    # LangGraph ReAct agent + GitHub tools
│   ├── app.py                      # FastAPI server (async job queue)
│   ├── requirements.txt            # Python dependencies
│   ├── Dockerfile                  # HuggingFace Spaces (Docker SDK)
│   ├── README.md
│   └── .env                        # ← Never commit this (add to .gitignore)
│
└── frontend/                       ← Deployed on Vercel
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx            # Main UI (input / loading / results)
    │   │   ├── layout.tsx          # Font setup + metadata
    │   │   └── globals.css         # Animations, glass effects
    │   ├── components/
    │   │   ├── ScoreRing.tsx       # Animated SVG score ring
    │   │   └── SubScoreBar.tsx     # Score bars per dimension
    │   └── lib/
    │       └── api.ts              # API client (submit + poll jobs)
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    └── .env.local                  # ← Never commit this (add to .gitignore)
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Agent | LangGraph + GPT-4o |
| Backend | Python, FastAPI |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend Hosting | HuggingFace Spaces (Docker) |
| Frontend Hosting | Vercel |
| Data Source | GitHub REST API v3 |

---

## 🤖 How It Works

```
User submits GitHub URL
        ↓
Next.js frontend → POST /evaluate → FastAPI
        ↓
LangGraph ReAct Agent:
  1. fetch_repo_metadata   → stars, forks, language, license
  2. fetch_repo_languages  → language breakdown
  3. fetch_repo_structure  → file/folder tree
  4. fetch_readme          → documentation quality
  5. fetch_commits         → commit history & activity
        ↓
GPT-4o reasons across all data
        ↓
Structured JSON score → Dashboard
```

---

## 📊 Scoring Rubric

| Dimension | Points |
|-----------|--------|
| Code Quality | 25 |
| Project Complexity | 25 |
| Documentation | 20 |
| Maintenance & Activity | 15 |
| Professional Standards | 15 |
| **Total** | **100** |

---

## 🚀 Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```
OPENAI_API_KEY=sk-your-key-here
GITHUB_TOKEN=ghp_your-token-here
```

Run:
```bash
uvicorn app:app --reload --port 7860
```

### Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:7860
```

Run:
```bash
npm run dev
```

Open http://localhost:3000

---

## ☁️ Deployment

### Backend → HuggingFace Spaces
1. Create new Space → choose **Docker** SDK
2. Upload `agent.py`, `app.py`, `requirements.txt`, `Dockerfile`, `README.md`
3. Add secret: `OPENAI_API_KEY` in Space Settings
4. Space auto-builds and runs on port 7860

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import repo on Vercel
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-space.hf.space`
4. Deploy

---

## 🔒 Security

- Never commit `.env` or `.env.local` files
- API keys are stored as HuggingFace Secrets and Vercel Environment Variables
- GitHub token scope: `public_repo` (read-only)
- CORS restricted to allowed origins in production

---

## 📄 Assignment

This project was built as part of **JSO Phase-2: Agentic Career Intelligence Development** by Priyanshu Bhati.

The full assignment document covering Part A (Core Questions), Part B (Agent Design), and Part C (Ethical & Governance Considerations) is included in the repository.
