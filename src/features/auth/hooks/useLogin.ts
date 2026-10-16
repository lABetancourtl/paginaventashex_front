import { useState } from 'react'
import { loginWithPassword, sendOtp, verifyOtp } from '../services/authService'
import { ApiRequestError } from '../../../api/client'
import { useAuth } from './useAuth'

const PASSWORD_NOT_SET = 'NO_PASSWORD'

// NUEVO: 'choose' es la pantalla inicial de elección
type LoginMethod = 'choose' | 'otp' | 'password'
type OtpStep = 'email' | 'code'
export type OtpIntent = 'login' | 'register' | 'reset'

export function useLogin() {
  const { login } = useAuth()

  const [method, setMethod] = useState<LoginMethod>('choose') // NUEVO
  const [step, setStep] = useState<OtpStep>('email')
  const [otpIntent, setOtpIntent] = useState<OtpIntent>('login')
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

  // ─── Flujo con código ─────────────────────────────────────
  const sendCode = async (emailToSend: string) => {
    setIsLoading(true)
    clearError()

    try {
      await sendOtp({ email: emailToSend })
      setEmail(emailToSend)
      setOtpSentAt(Date.now())
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

  // ─── Navegación entre pasos ───────────────────────────────
  const switchToPassword = () => {
    clearError()
    setMethod('password')
  }

  const switchToOtp = (prefillEmail?: string, intent: OtpIntent = 'login') => {
    clearError()
    setEmail(prefillEmail ?? '')
    setOtpIntent(intent)
    setStep('email')
    setMethod('otp')
  }

  // NUEVO: retrocede un paso
  const goBack = () => {
    clearError()

    // Del código, vuelve al email
    if (method === 'otp' && step === 'code') {
      setStep('email')
      return
    }

    setStep('email')

    // Si llegó al código desde "Regístrate" u "Olvidé mi contraseña",
    // la flecha lo devuelve al formulario de contraseña
    if (method === 'otp' && otpIntent !== 'login') {
      setMethod('password')
      return
    }

    setMethod('choose')
  }

  const suggestOtp = method === 'password' && errorCode === PASSWORD_NOT_SET

  return {
    method,
    step,
    otpIntent,
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
    goBack,
  }
}