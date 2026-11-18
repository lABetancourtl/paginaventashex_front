import type { ReactNode } from 'react'

export type BadgeTone = 'success' | 'neutral' | 'warning' | 'danger' | 'info'

// Pastillas con borde, como en el diseño de referencia
const toneClasses: Record<BadgeTone, { badge: string; dot: string }> = {
  success: { badge: 'border-green-200 bg-green-50 text-green-700', dot: 'bg-green-500' },
  neutral: { badge: 'border-admin-line bg-admin-bg text-ink-muted', dot: 'bg-ink-muted/60' },
  warning: { badge: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  danger: { badge: 'border-red-200 bg-red-50 text-red-700', dot: 'bg-red-500' },
  info: { badge: 'border-blue-200 bg-blue-50 text-admin-accent', dot: 'bg-admin-accent' },
}

interface StatusBadgeProps {
  tone: BadgeTone
  children: ReactNode
}

function StatusBadge({ tone, children }: StatusBadgeProps) {
  const classes = toneClasses[tone]

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${classes.badge}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${classes.dot}`} />
      {children}
    </span>
  )
}

export default StatusBadge
