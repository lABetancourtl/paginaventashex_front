import type { ReactNode } from 'react'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  required?: boolean
  hint?: string
  children: ReactNode // El input, select, etc.
}

function FormField({ id, label, error, required = false, hint, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      {children}

      {hint && !error && <p id={`${id}-hint`}>{hint}</p>}
      {error && <p id={`${id}-error`}>{error}</p>}
    </div>
  )
}

export default FormField