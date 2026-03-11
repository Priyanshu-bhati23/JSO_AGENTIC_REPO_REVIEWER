'use client'

import { useState, useEffect, useRef } from 'react'
import { Github, Search, ChevronRight, AlertCircle, CheckCircle2, TrendingUp, Code2, FileText, GitCommit, Shield, Zap, Users, Star, RefreshCw } from 'lucide-react'
import { submitEvaluation, pollJob, EvaluationResult, JobStatus } from '@/lib/api'
import ScoreRing from '@/components/ScoreRing'
import SubScoreBar from '@/components/SubScoreBar'

const DEMO_RESULT: EvaluationResult = {
  repo_name: "fastapi",
  overall_score: 91,
  grade: "A",
  sub_scores: {
    code_quality: 23,
    project_complexity: 24,
    documentation: 19,
    maintenance_activity: 13,
    professional_standards: 12,
  },
  strengths: [
    "Exceptionally clean architecture with dependency injection patterns",
    "Comprehensive test suite with 100%+ coverage across modules",
    "Professional documentation site with interactive examples",
    "Active community with 73k+ stars indicating wide adoption",
  ],
  improvements: [
    "Add more inline code comments for complex async flows",
    "Consider adding CHANGELOG.md for easier version tracking",
    "Some edge-case error handling could be more explicit",
  ],
  recruiter_summary: "This candidate demonstrates senior-level engineering ability. The repository shows production-quality code, excellent documentation practices, and strong community contribution. Recommended for senior/staff engineering roles.",
  tech_stack: ["Python", "FastAPI", "Pydantic", "Starlette", "Uvicorn", "pytest"],
  recommendation: "Strong Hire",
  github_url: "https://github.com/tiangolo/fastapi",
}

type Phase = 'input' | 'loading' | 'result' | 'error'

const LOADING_STEPS = [
  { icon: Github, text: "Connecting to GitHub API..." },
  { icon: Code2, text: "Analyzing repository structure..." },
  { icon: FileText, text: "Reading documentation..." },
  { icon: GitCommit, text: "Examining commit history..." },
  { icon: Zap, text: "Running AI evaluation..." },
  { icon: Shield, text: "Generating score & recommendations..." },
]

function recommendationStyle(rec: string) {
  if (rec === 'Strong Hire') return 'text-jade bg-jade/10 border-jade/30'
  if (rec === 'Consider') return 'text-amber bg-amber/10 border-amber/30'
  return 'text-crimson bg-crimson/10 border-crimson/30'
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>('input')
  const [githubUrl, setGithubUrl] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [jobRole, setJobRole] = useState('')
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)
  const [jobId, setJobId] = useState<string | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const stepRef = useRef<NodeJS.Timeout | null>(null)

  // Animate loading steps
  useEffect(() => {
    if (phase === 'loading') {
      setLoadingStep(0)
      stepRef.current = setInterval(() => {
        setLoadingStep(s => Math.min(s + 1, LOADING_STEPS.length - 1))
      }, 4000)
    } else {
      if (stepRef.current) clearInterval(stepRef.current)
    }
    return () => { if (stepRef.current) clearInterval(stepRef.current) }
  }, [phase])

  // Poll job status
  useEffect(() => {
    if (!jobId) return
    pollRef.current = setInterval(async () => {
      try {
        const status: JobStatus = await pollJob(jobId)
        if (status.status === 'complete' && status.result) {
          clearInterval(pollRef.current!)
          setResult(status.result)
          setPhase('result')
        } else if (status.status === 'error') {
          clearInterval(pollRef.current!)
          setErrorMsg(status.error || 'Evaluation failed')
          setPhase('error')
        }
      } catch {
        clearInterval(pollRef.current!)
        setErrorMsg('Lost connection to evaluation service')
        setPhase('error')
      }
    }, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [jobId])

  async function handleSubmit() {
    if (!githubUrl.trim()) return
    setPhase('loading')
    setErrorMsg('')

    try {
      const job = await submitEvaluation({
        github_url: githubUrl.trim(),
        candidate_name: candidateName.trim() || undefined,
        job_role: jobRole.trim() || undefined,
      })
      setJobId(job.job_id)
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Submission failed')
      setPhase('error')
    }
  }

  function loadDemo() {
    setResult(DEMO_RESULT)
    setPhase('result')
  }

  function reset() {
    setPhase('input')
    setResult(null)
    setJobId(null)
    setLoadingStep(0)
  }

  return (
    <main className="min-h-screen bg-ink relative overflow-x-hidden">
      {/* Grid background */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-jade/20 border border-jade/30 flex items-center justify-center glow-jade">
              <Code2 size={16} className="text-jade" />
            </div>
            <div>
              <span className="font-display text-sm font-semibold text-ink-50">JSO</span>
              <span className="text-ink-400 text-xs ml-2 font-mono">Portfolio Agent v1.0</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <div className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />
            <span className="font-mono">Agent Online</span>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">

        {/* ─── INPUT PHASE ────────────────────────────── */}
        {phase === 'input' && (
          <div className="animate-fade-up">
            {/* Hero */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-jade/80 bg-jade/5 border border-jade/20 rounded-full px-4 py-1.5 mb-6">
                <Zap size={11} />
                Phase 2 — Agentic Career Intelligence
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-ink-50 leading-tight mb-4">
                Code Portfolio<br />
                <span className="text-jade">Evaluation Agent</span>
              </h1>
              <p className="text-ink-400 text-lg max-w-xl mx-auto leading-relaxed">
                Submit a GitHub repository and receive an AI-powered technical assessment — fair, transparent, and recruiter-ready.
              </p>
            </div>

            {/* Input Card */}
            <div className="max-w-2xl mx-auto">
              <div className="glass rounded-2xl p-8 space-y-5">
                {/* GitHub URL */}
                <div className="space-y-2">
                  <label className="text-xs text-ink-400 uppercase tracking-widest font-mono">GitHub Repository URL *</label>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-jade/40 transition-colors">
                    <Github size={16} className="text-ink-400 shrink-0" />
                    <input
                      type="url"
                      placeholder="https://github.com/username/repository"
                      className="flex-1 bg-transparent text-ink-50 placeholder-ink-600 text-sm outline-none font-mono"
                      value={githubUrl}
                      onChange={e => setGithubUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    />
                  </div>
                </div>

                {/* Optional fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-ink-400 uppercase tracking-widest font-mono">Candidate Name</label>
                    <input
                      type="text"
                      placeholder="Optional"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ink-50 placeholder-ink-600 text-sm outline-none focus:border-jade/40 transition-colors"
                      value={candidateName}
                      onChange={e => setCandidateName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-ink-400 uppercase tracking-widest font-mono">Job Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Engineer"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ink-50 placeholder-ink-600 text-sm outline-none focus:border-jade/40 transition-colors"
                      value={jobRole}
                      onChange={e => setJobRole(e.target.value)}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={!githubUrl.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-jade text-ink font-semibold text-sm py-3 rounded-xl hover:bg-jade-light disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-jade"
                  >
                    <Search size={15} />
                    Evaluate Repository
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={loadDemo}
                    className="px-5 py-3 rounded-xl border border-white/10 text-ink-400 text-sm hover:text-ink-200 hover:border-white/20 transition-colors font-mono"
                  >
                    Demo
                  </button>
                </div>
              </div>

              {/* Info pills */}
              <div className="flex flex-wrap gap-3 justify-center mt-8">
                {['Code Quality', 'Complexity Analysis', 'Documentation', 'Commit Activity', 'Pro Standards'].map(tag => (
                  <span key={tag} className="text-xs font-mono text-ink-500 bg-white/3 border border-white/8 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── LOADING PHASE ──────────────────────────── */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-up">
            {/* Animated orb */}
            <div className="relative mb-12">
              <div className="w-24 h-24 rounded-full bg-jade/10 border border-jade/20 flex items-center justify-center glow-jade">
                <div className="w-16 h-16 rounded-full bg-jade/20 border border-jade/40 flex items-center justify-center animate-pulse">
                  <Code2 size={24} className="text-jade" />
                </div>
              </div>
              {/* Orbit ring */}
              <div className="absolute inset-0 rounded-full border border-jade/15 animate-spin" style={{ animationDuration: '3s' }} />
            </div>

            <h2 className="font-display text-2xl text-ink-50 mb-2">Analyzing Repository</h2>
            <p className="text-ink-500 text-sm font-mono mb-10">LangGraph agent at work...</p>

            {/* Steps */}
            <div className="space-y-3 w-full max-w-sm">
              {LOADING_STEPS.map((step, i) => {
                const Icon = step.icon
                const done = i < loadingStep
                const active = i === loadingStep
                return (
                  <div key={i} className={`flex items-center gap-3 py-2 px-4 rounded-lg transition-all duration-500 ${active ? 'bg-jade/10 border border-jade/20' : done ? 'opacity-40' : 'opacity-20'}`}>
                    <Icon size={14} className={active ? 'text-jade' : done ? 'text-jade/60' : 'text-ink-600'} />
                    <span className={`text-sm font-mono ${active ? 'text-jade' : 'text-ink-500'}`}>{step.text}</span>
                    {done && <CheckCircle2 size={13} className="text-jade/60 ml-auto" />}
                    {active && (
                      <div className="flex gap-1 ml-auto">
                        {[0,1,2].map(d => (
                          <div key={d} className="w-1 h-1 rounded-full bg-jade loader-dot animate-pulse-dot" style={{ animationDelay: `${d * 0.2}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── RESULT PHASE ───────────────────────────── */}
        {phase === 'result' && result && (
          <div className="space-y-8 animate-stagger">

            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-ink-500 mb-1">
                  {result.candidate_name && <span className="text-ink-300 mr-3">👤 {result.candidate_name}</span>}
                  {result.job_role && <span className="text-ink-400">⟶ {result.job_role}</span>}
                </div>
                <h2 className="font-display text-3xl text-ink-50">
                  <span className="font-mono text-jade">{result.repo_name}</span>
                  <span className="text-ink-600 mx-2">/</span>
                  Evaluation Report
                </h2>
              </div>
              <button onClick={reset} className="flex items-center gap-2 text-xs font-mono text-ink-500 hover:text-ink-200 border border-white/10 px-4 py-2 rounded-lg hover:border-white/20 transition-colors">
                <RefreshCw size={12} />
                New Evaluation
              </button>
            </div>

            {/* Score + Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score ring */}
              <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center glow-jade">
                <ScoreRing score={result.overall_score} grade={result.grade} size={170} />
                <div className={`mt-4 text-xs font-semibold px-4 py-1.5 rounded-full border ${recommendationStyle(result.recommendation)}`}>
                  {result.recommendation}
                </div>
              </div>

              {/* Sub scores */}
              <div className="glass rounded-2xl p-6 space-y-5 md:col-span-2">
                <h3 className="text-xs text-ink-400 uppercase tracking-widest font-mono border-b border-white/5 pb-3">Dimension Breakdown</h3>
                <SubScoreBar label="Code Quality" score={result.sub_scores.code_quality} max={25} delay={0} />
                <SubScoreBar label="Project Complexity" score={result.sub_scores.project_complexity} max={25} delay={100} />
                <SubScoreBar label="Documentation" score={result.sub_scores.documentation} max={20} delay={200} />
                <SubScoreBar label="Maintenance & Activity" score={result.sub_scores.maintenance_activity} max={15} delay={300} />
                <SubScoreBar label="Professional Standards" score={result.sub_scores.professional_standards} max={15} delay={400} />
              </div>
            </div>

            {/* Recruiter Summary */}
            <div className="glass rounded-2xl p-6 border-l-2 border-jade/40">
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-jade" />
                <span className="text-xs font-mono text-ink-400 uppercase tracking-widest">HR Consultant Summary</span>
              </div>
              <p className="text-ink-200 leading-relaxed">{result.recruiter_summary}</p>
            </div>

            {/* Strengths + Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={14} className="text-jade" />
                  <span className="text-xs font-mono text-ink-400 uppercase tracking-widest">Strengths</span>
                </div>
                <ul className="space-y-3">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={14} className="text-jade shrink-0 mt-0.5" />
                      <span className="text-ink-300 text-sm leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={14} className="text-amber" />
                  <span className="text-xs font-mono text-ink-400 uppercase tracking-widest">Improvements</span>
                </div>
                <ul className="space-y-3">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <ChevronRight size={14} className="text-amber shrink-0 mt-0.5" />
                      <span className="text-ink-300 text-sm leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tech Stack */}
            {result.tech_stack?.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={14} className="text-amber" />
                  <span className="text-xs font-mono text-ink-400 uppercase tracking-widest">Technology Stack</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.tech_stack.map((tech, i) => (
                    <span key={i} className="text-xs font-mono bg-white/5 border border-white/10 text-ink-300 px-3 py-1.5 rounded-lg hover:border-jade/30 hover:text-jade/90 transition-colors cursor-default">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer note */}
            <p className="text-center text-xs text-ink-600 font-mono">
              Evaluated {result.evaluated_at ? new Date(result.evaluated_at).toLocaleString() : 'just now'} · 
              JSO Code Portfolio Agent · Transparent & Auditable AI Scoring
            </p>
          </div>
        )}

        {/* ─── ERROR PHASE ────────────────────────────── */}
        {phase === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-crimson/10 border border-crimson/30 flex items-center justify-center mb-6">
              <AlertCircle size={24} className="text-crimson" />
            </div>
            <h2 className="font-display text-2xl text-ink-50 mb-3">Evaluation Failed</h2>
            <p className="text-ink-500 text-sm font-mono mb-8 max-w-md text-center">{errorMsg}</p>
            <div className="flex gap-3">
              <button onClick={reset} className="flex items-center gap-2 bg-white/8 text-ink-200 text-sm px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                <RefreshCw size={14} />
                Try Again
              </button>
              <button onClick={loadDemo} className="flex items-center gap-2 text-jade text-sm px-6 py-3 rounded-xl border border-jade/30 hover:bg-jade/10 transition-colors">
                View Demo
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
