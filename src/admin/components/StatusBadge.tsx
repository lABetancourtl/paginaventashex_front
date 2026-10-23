import type { ReactNode } from 'react'

type BadgeTone = 'success' | 'neutral' | 'warning'

const toneClasses: Record<BadgeTone, { badge: string; dot: string }> = {
  success: { badge: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  neutral: { badge: 'bg-line/60 text-ink-muted', dot: 'bg-ink-muted/60' },
  warning: { badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
}

interface StatusBadgeProps {
  tone: BadgeTone
  children: ReactNode
}

function StatusBadge({ tone, children }: StatusBadgeProps) {
  const classes = toneClasses[tone]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${classes.badge}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${classes.dot}`} />
      {children}
    </span>
  )
}

export default StatusBadge