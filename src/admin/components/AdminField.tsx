import type { ReactNode } from 'react'

interface AdminFieldProps {
  id: string
  label: string
  error?: string
  required?: boolean
  hint?: ReactNode
  aside?: ReactNode // Texto a la derecha de la etiqueta (ej: contador)
  look?: 'default' | 'neutral' // neutral: colores del estilo Tisoro
  children: ReactNode
}

// Campo de formulario del panel: etiqueta, control, ayuda y error
function AdminField({ id, label, error, required = false, hint, aside, look = 'default', children }: AdminFieldProps) {
  const isNeutral = look === 'neutral'
  const mutedClass = isNeutral ? 'text-[#8b8a84]' : 'text-ink-muted'

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className={`text-[13px] font-medium ${isNeutral ? 'text-admin-ink' : 'text-ink'}`}>
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger">
              {' '}*
            </span>
          )}
        </label>
        {aside && <span className={`text-xs tabular-nums ${isNeutral ? 'text-[#9a9993]' : 'text-ink-muted'}`}>{aside}</span>}
      </div>

      {children}

      {hint && !error && (
        <p id={`${id}-hint`} className={`mt-1.5 text-xs ${mutedClass}`}>
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
  look?: 'default' | 'neutral'
  children: ReactNode
}

export function AdminInputGroup({ prefix, suffix, look = 'default', children }: AdminInputGroupProps) {
  const affixColor = look === 'neutral' ? 'text-[#8b8a84]' : 'text-ink-muted'
  return (
    <div className="relative flex items-stretch">
      {prefix && (
        <span className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm ${affixColor}`}>
          {prefix}
        </span>
      )}
      {children}
      {suffix && (
        <span className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium ${affixColor}`}>
          {suffix}
        </span>
      )}
    </div>
  )
}

export default AdminField
