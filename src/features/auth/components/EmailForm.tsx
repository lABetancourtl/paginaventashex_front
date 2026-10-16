import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import FormField from '../../../components/FormField'
import { inputClass, primaryButtonClass } from '../../../components/formStyles'

interface EmailFormProps {
  initialEmail?: string
  description: string 
  isLoading: boolean
  error: string | null
  onSubmit: (email: string) => void
}

function EmailForm({ initialEmail = '', description, isLoading, error, onSubmit }: EmailFormProps) {
  const emailId = useId()
  const [email, setEmail] = useState(initialEmail)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(email.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-center text-sm text-ink-muted">{description}</p>

      <FormField id={emailId} label="Correo electrónico">
        <input
          id={emailId}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          autoComplete="email"
          required
          autoFocus
          disabled={isLoading}
          className={inputClass}
        />
      </FormField>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <button type="submit" disabled={isLoading} className={primaryButtonClass}>
        {isLoading ? 'Enviando...' : 'Enviar código'}
      </button>
    </form>
  )
}

export default EmailForm