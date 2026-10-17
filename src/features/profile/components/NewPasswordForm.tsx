import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import FormField from '../../../components/FormField'
import PasswordInput from '../../../components/PasswordInput'
import { inputClass, linkButtonClass, primaryButtonClass } from '../../../components/formStyles'
import { useCountdown } from '../../../hooks/useCountdown'
import type { SetPasswordRequest } from '../types'

// IMPORTANTE: ajusta según las reglas de tu backend
const MIN_PASSWORD_LENGTH = 8
const CODE_LENGTH = 6
const OTP_DURATION_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 30 * 1000

interface NewPasswordFormProps {
  email: string
  requiresCode: boolean
  otpSentAt: number | null
  isSaving: boolean
  isResending: boolean
  serverError: string | null
  onSubmit: (request: SetPasswordRequest) => void
  onResend: () => void
  onCancel: () => void
}

interface FormErrors {
  code?: string
  password?: string
}

function NewPasswordForm({
  email,
  requiresCode,
  otpSentAt,
  isSaving,
  isResending,
  serverError,
  onSubmit,
  onResend,
  onCancel,
}: NewPasswordFormProps) {
  const codeId = useId()
  const passwordId = useId()

  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  // Los contadores solo existen si se pidió un código
  const sentAt = requiresCode ? otpSentAt : null
  const expiresIn = useCountdown(sentAt === null ? null : sentAt + OTP_DURATION_MS)
  const resendIn = useCountdown(sentAt === null ? null : sentAt + RESEND_COOLDOWN_MS)
  const isExpired = requiresCode && expiresIn === 0

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validationErrors: FormErrors = {}
    if (requiresCode && code.length !== CODE_LENGTH) {
      validationErrors.code = `Escribe el código de ${CODE_LENGTH} dígitos que enviamos a tu correo.`
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      validationErrors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
    }

    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    onSubmit({
      otpCode: code,
      newPassword: password,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid max-w-md grid-cols-1 gap-y-5"
    >
      {/* Para los gestores de contraseñas: a qué cuenta pertenece esta contraseña */}
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />

      {requiresCode && (
        <div>
          <FormField id={codeId} label="Código de verificación" required error={errors.code}>
            <input
              id={codeId}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))
                setErrors((prev) => ({ ...prev, code: undefined }))
              }}
              placeholder="000000"
              disabled={isSaving || isExpired}
              autoFocus
              aria-required="true"
              aria-invalid={errors.code ? true : undefined}
              aria-describedby={errors.code ? `${codeId}-error` : undefined}
              className={`${inputClass} text-center text-xl font-semibold tracking-[0.4em]`}
            />
          </FormField>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            {isExpired ? (
              <span className="text-danger">El código expiró.</span>
            ) : (
              <span className="text-ink-muted">
                Vence en {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, '0')}
              </span>
            )}
            <button
              type="button"
              onClick={onResend}
              disabled={isSaving || isResending || resendIn > 0}
              className={linkButtonClass}
            >
              {isResending
                ? 'Enviando...'
                : resendIn > 0
                  ? `Reenviar en ${resendIn}s`
                  : 'Reenviar código'}
            </button>
          </div>
        </div>
      )}

      <FormField
        id={passwordId}
        label="Nueva contraseña"
        required
        error={errors.password}
        hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
      >
        <PasswordInput
          id={passwordId}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setErrors((prev) => ({ ...prev, password: undefined }))
          }}
          autoComplete="new-password"
          autoFocus={!requiresCode}
          disabled={isSaving}
          aria-required="true"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? `${passwordId}-error` : `${passwordId}-hint`}
        />
      </FormField>

      <div className="flex flex-col gap-3 pt-1">
        {serverError && (
          <p role="alert" className="text-sm text-danger">
            {serverError}
          </p>
        )}
        <button type="submit" disabled={isSaving || isExpired} className={primaryButtonClass}>
          {isSaving ? 'Guardando...' : 'Guardar contraseña'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className={`${linkButtonClass} self-center`}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default NewPasswordForm