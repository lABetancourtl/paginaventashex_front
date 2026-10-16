import type { ReactNode } from 'react'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  required?: boolean
  hint?: string
  children: ReactNode
}

function FormField({ id, label, error, required = false, hint, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-wide">
        {label}
        {required && (
          <span aria-hidden="true" className="text-danger">
            {' '}*
          </span>
        )}
      </label>

      {children}

      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-muted">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField