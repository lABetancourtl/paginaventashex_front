import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'

// O lleva a una ruta (backTo), o ejecuta una acción (onBack). Nunca ambas.
type BackHeaderProps = {
  title: string
  backLabel: string
} & (
  | { backTo: string; onBack?: never }
  | { onBack: () => void; backTo?: never }
)

const backClass = 'p-1 hover:text-ink-muted'

function BackHeader({ title, backLabel, backTo, onBack }: BackHeaderProps) {
  const icon = <ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" />

  return (
    <div className="mb-4 flex items-center gap-3">
      {backTo !== undefined ? (
        <Link to={backTo} aria-label={backLabel} className={backClass}>
          {icon}
        </Link>
      ) : (
        <button type="button" onClick={onBack} aria-label={backLabel} className={backClass}>
          {icon}
        </button>
      )}
      <h2 className="text-lg font-extrabold uppercase tracking-wide">{title}</h2>
    </div>
  )
}

export default BackHeader