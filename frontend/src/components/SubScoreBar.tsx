'use client'

interface SubScoreBarProps {
  label: string
  score: number
  max: number
  delay?: number
}

export default function SubScoreBar({ label, score, max, delay = 0 }: SubScoreBarProps) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 75 ? '#00B37D' : pct >= 50 ? '#F5A623' : '#E53935'

  return (
    <div className="space-y-1.5" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-ink-300 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-mono" style={{ color }}>
          {score}<span className="text-ink-500">/{max}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}60`,
            transitionDelay: `${delay + 300}ms`,
          }}
        />
      </div>
    </div>
  )
}
