import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCountdown } from '../../../hooks/useCountdown'

const CODE_LENGTH = 6
const OTP_DURATION_MS = 10 * 60 * 1000 // 10 minutos
const RESEND_COOLDOWN_MS = 30 * 1000   // 30 segundos

// Convierte segundos a formato m:ss (ej: 125 → "2:05")
function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

interface CodeFormProps {
  email: string
  otpSentAt: number
  isLoading: boolean
  error: string | null
  onSubmit: (code: string) => void
  onResend: () => void
  onChangeEmail: () => void
}

function CodeForm({
  email,
  otpSentAt,
  isLoading,
  error,
  onSubmit,
  onResend,
  onChangeEmail,
}: CodeFormProps) {
  const [code, setCode] = useState('')

  // Dos contadores a partir del mismo momento de envío
  const expiresIn = useCountdown(otpSentAt + OTP_DURATION_MS)
  const resendIn = useCountdown(otpSentAt + RESEND_COOLDOWN_MS)

  const isExpired = expiresIn === 0
  const isComplete = code.length === CODE_LENGTH

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(code)
  }

  const handleChange = (value: string) => {
    const onlyDigits = value.replace(/\D/g, '').slice(0, CODE_LENGTH)
    setCode(onlyDigits)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Ingresa el código</h2>
      <p>Enviamos un código de {CODE_LENGTH} dígitos a <strong>{email}</strong></p>

      <label htmlFor="code">Código de verificación</label>
      <input
        id="code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="000000"
        disabled={isLoading || isExpired}
        autoFocus
      />

      {isExpired ? (
        <p>El código expiró. Solicita uno nuevo.</p>
      ) : (
        <p>El código vence en {formatTime(expiresIn)}</p>
      )}

      {error && <p>{error}</p>}

      <button type="submit" disabled={isLoading || !isComplete || isExpired}>
        {isLoading ? 'Verificando...' : 'Verificar'}
      </button>

      <button type="button" onClick={onResend} disabled={isLoading || resendIn > 0}>
        {resendIn > 0 ? `Reenviar código en ${resendIn}s` : 'Reenviar código'}
      </button>

      <button type="button" onClick={onChangeEmail} disabled={isLoading}>
        Cambiar correo
      </button>
    </form>
  )
}

export default CodeForm