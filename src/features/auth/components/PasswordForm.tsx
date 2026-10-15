import { useState } from 'react'
import type { FormEvent } from 'react'

interface PasswordFormProps {
  isLoading: boolean
  error: string | null
  suggestOtp: boolean
  onSubmit: (email: string, password: string) => void
  onUseOtp: (email: string) => void
}

function PasswordForm({ isLoading, error, suggestOtp, onSubmit, onUseOtp }: PasswordFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(email.trim(), password)
  }

  const trimmedEmail = email.trim()

  return (
    <form onSubmit={handleSubmit}>
      <h2>Ingresar con contraseña</h2>

      <label htmlFor="login-email">Correo electrónico</label>
      <input
        id="login-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@correo.com"
        autoComplete="email"
        required
        disabled={isLoading}
      />

      <label htmlFor="login-password">Contraseña</label>
      <input
        id="login-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
        disabled={isLoading}
      />

      {error && <p>{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Ingresando...' : 'Ingresar'}
      </button>

      {/* Un solo botón para cambiar a OTP, conservando el email escrito */}
      <button type="button" onClick={() => onUseOtp(trimmedEmail)} disabled={isLoading}>
        {suggestOtp && trimmedEmail
          ? `Enviarme un código a ${trimmedEmail}`
          : 'Ingresar con un código al correo'}
      </button>
    </form>
  )
}

export default PasswordForm