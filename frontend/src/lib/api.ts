const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7860'

export interface EvaluationRequest {
  github_url: string
  candidate_name?: string
  job_role?: string
}

export interface SubScores {
  code_quality: number
  project_complexity: number
  documentation: number
  maintenance_activity: number
  professional_standards: number
}

export interface EvaluationResult {
  repo_name: string
  overall_score: number
  grade: string
  sub_scores: SubScores
  strengths: string[]
  improvements: string[]
  recruiter_summary: string
  tech_stack: string[]
  recommendation: string
  github_url?: string
  candidate_name?: string
  job_role?: string
  evaluated_at?: string
  error?: string
}

export interface JobStatus {
  job_id: string
  status: 'pending' | 'running' | 'complete' | 'error'
  created_at: string
  result?: EvaluationResult
  error?: string
}

export async function submitEvaluation(req: EvaluationRequest): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `API error ${res.status}`)
  }
  return res.json()
}

export async function pollJob(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/evaluate/${jobId}`)
  if (!res.ok) throw new Error(`Poll error ${res.status}`)
  return res.json()
}

export async function evaluateSync(req: EvaluationRequest): Promise<EvaluationResult> {
  const res = await fetch(`${API_BASE}/evaluate/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `API error ${res.status}`)
  }
  return res.json()
}
