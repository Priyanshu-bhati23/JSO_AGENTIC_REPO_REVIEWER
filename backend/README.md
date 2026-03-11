# JSO Portfolio Evaluation Agent — Backend

LangGraph-powered AI agent that analyzes GitHub repositories and scores technical candidates.

## Deploy to HuggingFace Spaces

1. Create a new Space at [huggingface.co/spaces](https://huggingface.co/spaces)
2. Choose **Docker** as the SDK
3. Upload these files or push via Git
4. Add Secrets in Space Settings:
   - `OPENAI_API_KEY` — your OpenAI API key
   - `GITHUB_TOKEN` — (optional) GitHub PAT for higher rate limits

## Local Development

```bash
pip install -r requirements.txt
cp .env.example .env   # Fill in your keys
uvicorn app:app --reload --port 7860
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service info |
| GET | `/health` | Health check |
| POST | `/evaluate` | Submit async evaluation job |
| GET | `/evaluate/{job_id}` | Poll job status/result |
| POST | `/evaluate/sync` | Synchronous evaluation (testing) |

## Architecture

```
Request → FastAPI → Background Task → LangGraph Agent
                                           │
                    ┌──────────────────────┤
                    │                      │
              GitHub Tools              OpenAI GPT-4o
              (metadata,                (reasoning &
               languages,               scoring)
               structure,
               README,
               commits)
                    │
                    └──── Structured JSON Score
```
