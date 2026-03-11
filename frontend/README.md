# JSO Portfolio Evaluation Agent — Frontend

Next.js frontend for the JSO Code Portfolio Evaluation Agent. Deployable on Vercel.

## Deploy to Vercel

1. Push this `frontend/` folder to a GitHub repository (or the whole monorepo)
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set **Root Directory** to `frontend/` (if using monorepo)
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = your HuggingFace Spaces URL
     (e.g. `https://your-username-jso-portfolio-agent.hf.space`)
5. Deploy!

## Local Development

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- Submit GitHub repository URLs for AI evaluation
- Real-time job status polling (async evaluation)
- Visual score ring with animated sub-score bars
- Strengths & improvement recommendations
- HR-ready recruiter summary
- Technology stack detection
- Hire/No-Hire recommendation
- Demo mode (no API key needed)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Playfair Display + DM Sans + JetBrains Mono fonts
- Lucide React icons
