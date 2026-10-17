import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'

interface BackHeaderProps {
  title: string
  backTo: string
  backLabel: string // Para lectores de pantalla, ej: "Volver a direcciones"
}

function BackHeader({ title, backTo, backLabel }: BackHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <Link to={backTo} aria-label={backLabel} className="p-1 hover:text-ink-muted">
        <ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" />
      </Link>
      <h2 className="text-lg font-extrabold uppercase tracking-wide">{title}</h2>
    </div>
  )
}

export default BackHeader