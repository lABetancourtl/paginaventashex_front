import { useState } from 'react'
import type { FormEvent } from 'react'

interface EmailFormProps {
  initialEmail?: string // NUEVO: opcional
  isLoading: boolean
  error: string | null
  onSubmit: (email: string) => void
}

function EmailForm({ initialEmail = '', isLoading, error, onSubmit }: EmailFormProps) {
  const [email, setEmail] = useState(initialEmail)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(email.trim())
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar sesión</h2>
      <p>Te enviaremos un código de acceso a tu correo.</p>

      <label htmlFor="email">Correo electrónico</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@correo.com"
        autoComplete="email"
        required
        disabled={isLoading}
      />

      {error && <p>{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Enviando...' : 'Enviar código'}
      </button>
    </form>
  )
}

export default EmailForm