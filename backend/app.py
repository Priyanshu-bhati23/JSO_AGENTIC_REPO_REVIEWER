"""
JSO Portfolio Evaluation Agent - FastAPI Server
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Force load .env from the same directory as this file
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

import json
import asyncio
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

# Debug: print to confirm key is loaded (remove after testing)
key = os.getenv("OPENAI_API_KEY", "NOT_FOUND")
print(f"[STARTUP] OPENAI_API_KEY loaded: {key[:10]}...")

jobs: dict = {}

app = FastAPI(
    title="JSO Code Portfolio Evaluation Agent",
    description="AI-powered GitHub repository analysis for technical candidate evaluation",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EvaluationRequest(BaseModel):
    github_url: str
    candidate_name: Optional[str] = None
    job_role: Optional[str] = None


class EvaluationStatus(BaseModel):
    job_id: str
    status: str
    created_at: str
    result: Optional[dict] = None
    error: Optional[str] = None


async def run_evaluation(job_id: str, request: EvaluationRequest):
    jobs[job_id]["status"] = "running"
    try:
        from agent import evaluate_repository
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, evaluate_repository, request.github_url)
        result["candidate_name"] = request.candidate_name
        result["job_role"] = request.job_role
        result["evaluated_at"] = datetime.utcnow().isoformat()
        result["github_url"] = request.github_url
        jobs[job_id]["status"] = "complete"
        jobs[job_id]["result"] = result
    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)


@app.get("/")
def root():
    return {"service": "JSO Code Portfolio Evaluation Agent", "version": "1.0.0", "status": "operational"}


@app.get("/health")
def health():
    key = os.getenv("OPENAI_API_KEY", "")
    return {
        "status": "ok",
        "openai_configured": bool(key) and not key.startswith("sk-your"),
        "key_preview": key[:12] + "..." if key else "NOT SET",
    }


@app.post("/evaluate", response_model=EvaluationStatus)
async def create_evaluation(request: EvaluationRequest, background_tasks: BackgroundTasks):
    if "github.com" not in request.github_url:
        raise HTTPException(status_code=400, detail="URL must be a GitHub repository URL")
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "job_id": job_id,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
        "result": None,
        "error": None,
    }
    background_tasks.add_task(run_evaluation, job_id, request)
    return EvaluationStatus(**jobs[job_id])


@app.get("/evaluate/{job_id}", response_model=EvaluationStatus)
def get_evaluation(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return EvaluationStatus(**jobs[job_id])


@app.post("/evaluate/sync")
async def evaluate_sync(request: EvaluationRequest):
    try:
        from agent import evaluate_repository
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, evaluate_repository, request.github_url)
        result["github_url"] = request.github_url
        result["candidate_name"] = request.candidate_name
        result["job_role"] = request.job_role
        result["evaluated_at"] = datetime.utcnow().isoformat()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 7860))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
