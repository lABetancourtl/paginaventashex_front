import { useState } from 'react'
import { loginWithPassword, sendOtp, verifyOtp } from '../services/authService'
import { ApiRequestError } from '../../../api/client'
import { useAuth } from './useAuth'

// Código de error del backend cuando el usuario no tiene contraseña.
// IMPORTANTE: verifica que coincida con el code real de tu backend.
const PASSWORD_NOT_SET = 'NO_PASSWORD'

type LoginMethod = 'otp' | 'password'
type OtpStep = 'email' | 'code'

export function useLogin() {
  const { login } = useAuth()

  const [method, setMethod] = useState<LoginMethod>('otp')
  const [step, setStep] = useState<OtpStep>('email')
  const [email, setEmail] = useState('')
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  // ─── Manejo de errores compartido ─────────────────────────
  const clearError = () => {
    setError(null)
    setErrorCode(null)
  }

  const handleError = (err: unknown) => {
    if (err instanceof ApiRequestError) {
      setError(err.message)
      setErrorCode(err.code)
    } else {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setErrorCode(null)
    }
  }

  // ─── Flujo OTP ────────────────────────────────────────────
  const sendCode = async (emailToSend: string) => {
    setIsLoading(true)
    clearError()

    try {
      await sendOtp({ email: emailToSend })
      setEmail(emailToSend)
      setOtpSentAt(Date.now()) // Inicia los contadores
      setStep('code')
    } catch (err) {
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async (code: string) => {
    setIsLoading(true)
    clearError()

    try {
      const data = await verifyOtp({ email, code })
      login(data)
    } catch (err) {
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = () => {
    sendCode(email)
  }

  const changeEmail = () => {
    clearError()
    setStep('email')
  }

  // ─── Flujo con contraseña ─────────────────────────────────
  const submitPassword = async (emailToUse: string, password: string) => {
    setIsLoading(true)
    clearError()

    try {
      const data = await loginWithPassword({ email: emailToUse, password })
      login(data)
    } catch (err) {
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Cambio de método ─────────────────────────────────────
  const switchToPassword = () => {
    clearError()
    setMethod('password')
  }

  // Puede recibir un email para dejarlo ya escrito en el formulario OTP
  const switchToOtp = (prefillEmail?: string) => {
    clearError()
    setEmail(prefillEmail ?? '')
    setStep('email')
    setMethod('otp')
  }

  // Estado derivado: ¿sugerimos usar OTP?
  const suggestOtp = method === 'password' && errorCode === PASSWORD_NOT_SET

  return {
    method,
    step,
    email,
    otpSentAt,
    isLoading,
    error,
    suggestOtp,
    sendCode,
    verifyCode,
    resendCode,
    changeEmail,
    submitPassword,
    switchToPassword,
    switchToOtp,
  }
}