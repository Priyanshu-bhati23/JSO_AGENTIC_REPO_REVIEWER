'use client'

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  grade: string
}

function gradeColor(grade: string) {
  if (grade === 'A') return '#00B37D'
  if (grade === 'B') return '#00D496'
  if (grade === 'C') return '#F5A623'
  if (grade === 'D') return '#FB8C00'
  return '#E53935'
}

export default function ScoreRing({ score, size = 160, strokeWidth = 10, grade }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const filled = ((100 - score) / 100) * circumference
  const color = gradeColor(grade)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          className="score-ring-path"
          style={{ '--target-offset': filled } as React.CSSProperties}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-display font-bold leading-none"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-xs text-ink-300 mt-1 tracking-widest uppercase">/ 100</span>
        <span
          className="text-sm font-display font-semibold mt-1"
          style={{ color }}
        >
          Grade {grade}
        </span>
      </div>
    </div>
  )
}
