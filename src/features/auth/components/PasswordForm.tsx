import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import FormField from '../../../components/FormField'
import PasswordInput from '../../../components/PasswordInput'
import {
  inputClass,
  linkButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../../../components/formStyles'

interface PasswordFormProps {
  isLoading: boolean
  error: string | null
  suggestOtp: boolean
  onSubmit: (email: string, password: string) => void
  onUseOtp: (email: string) => void
  onRegister: (email: string) => void      
  onForgotPassword: (email: string) => void 
}

function PasswordForm({
  isLoading,
  error,
  suggestOtp,
  onSubmit,
  onUseOtp,
  onRegister,
  onForgotPassword,
}: PasswordFormProps) {
  const emailId = useId()
  const passwordId = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(email.trim(), password)
  }

  const trimmedEmail = email.trim()
  const showSuggestion = suggestOtp && trimmedEmail !== ''

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <FormField id={passwordId} label="Contraseña">
        <PasswordInput
          id={passwordId}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          disabled={isLoading}
        />
      </FormField>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <button type="submit" disabled={isLoading} className={primaryButtonClass}>
        {isLoading ? 'Ingresando...' : 'Ingresar'}
      </button>

      {showSuggestion && (
        <button
          type="button"
          onClick={() => onUseOtp(trimmedEmail)}
          disabled={isLoading}
          className={secondaryButtonClass}
        >
          Enviarme un código a {trimmedEmail}
        </button>
      )}

      {/* NUEVO: registro y recuperación, ambos llevan al ingreso con código */}
      <div className="flex flex-col items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => onRegister(trimmedEmail)}
          disabled={isLoading}
          className={linkButtonClass}
        >
          ¿No tienes cuenta? Regístrate
        </button>

        <button
          type="button"
          onClick={() => onForgotPassword(trimmedEmail)}
          disabled={isLoading}
          className={linkButtonClass}
        >
          Olvidé mi contraseña
        </button>
      </div>
    </form>
  )
}

export default PasswordForm