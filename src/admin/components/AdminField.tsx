import type { ReactNode } from 'react'

interface AdminFieldProps {
  id: string
  label: string
  error?: string
  required?: boolean
  hint?: ReactNode
  aside?: ReactNode // Texto a la derecha de la etiqueta (ej: contador)
  children: ReactNode
}

// Campo de formulario del panel: etiqueta, control, ayuda y error
function AdminField({ id, label, error, required = false, hint, aside, children }: AdminFieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-ink">
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger">
              {' '}*
            </span>
          )}
        </label>
        {aside && <span className="text-xs text-ink-muted">{aside}</span>}
      </div>

      {children}

      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-muted">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

// Control con texto fijo a los lados (ej: "$" y "COP", o "/categoria/")
interface AdminInputGroupProps {
  prefix?: ReactNode
  suffix?: ReactNode
  children: ReactNode
}

export function AdminInputGroup({ prefix, suffix, children }: AdminInputGroupProps) {
  return (
    <div className="relative flex items-stretch">
      {prefix && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-ink-muted">
          {prefix}
        </span>
      )}
      {children}
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-ink-muted">
          {suffix}
        </span>
      )}
    </div>
  )
}

export default AdminField
