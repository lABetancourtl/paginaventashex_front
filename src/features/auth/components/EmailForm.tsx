import { useState } from 'react'
import type { FormEvent } from 'react'

interface EmailFormProps {
  isLoading: boolean
  error: string | null
  onSubmit: (email: string) => void
}

function EmailForm({ isLoading, error, onSubmit }: EmailFormProps) {
  // Lo que el usuario está escribiendo en este momento
  const [email, setEmail] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Evita que el navegador recargue la página
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