import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { useCountdown } from '../../../hooks/useCountdown'
import FormField from '../../../components/FormField'
import { inputClass, linkButtonClass, primaryButtonClass } from '../../../components/formStyles'

const CODE_LENGTH = 6
const OTP_DURATION_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 30 * 1000

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
  const codeId = useId()
  const [code, setCode] = useState('')

  const expiresIn = useCountdown(otpSentAt + OTP_DURATION_MS)
  const resendIn = useCountdown(otpSentAt + RESEND_COOLDOWN_MS)

  const isExpired = expiresIn === 0
  const isComplete = code.length === CODE_LENGTH

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(code)
  }

  const handleChange = (value: string) => {
    setCode(value.replace(/\D/g, '').slice(0, CODE_LENGTH))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-center text-sm text-ink-muted">
        Enviamos un código de {CODE_LENGTH} dígitos a{' '}
        <strong className="break-all font-semibold text-ink">{email}</strong>
      </p>

      <FormField id={codeId} label="Código de verificación">
        <input
          id={codeId}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="000000"
          disabled={isLoading || isExpired}
          autoFocus
          className={`${inputClass} text-center text-2xl font-semibold tracking-[0.5em]`}
        />
      </FormField>

      {isExpired ? (
        <p className="text-sm text-danger">El código expiró. Solicita uno nuevo.</p>
      ) : (
        <p className="text-sm text-ink-muted">El código vence en {formatTime(expiresIn)}</p>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || !isComplete || isExpired}
        className={primaryButtonClass}
      >
        {isLoading ? 'Verificando...' : 'Verificar'}
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <button
          type="button"
          onClick={onResend}
          disabled={isLoading || resendIn > 0}
          className={linkButtonClass}
        >
          {resendIn > 0 ? `Reenviar código en ${resendIn}s` : 'Reenviar código'}
        </button>

        <button
          type="button"
          onClick={onChangeEmail}
          disabled={isLoading}
          className={linkButtonClass}
        >
          Cambiar correo
        </button>
      </div>
    </form>
  )
}

export default CodeForm