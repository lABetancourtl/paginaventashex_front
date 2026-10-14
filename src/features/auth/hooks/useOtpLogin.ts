import { useState } from 'react'
import { sendOtp, verifyOtp } from '../services/authService'
import type { AuthSession } from '../types'

// Ahora el flujo tiene tres pasos
type LoginStep = 'email' | 'code' | 'done'

export function useOtpLogin() {
  const [step, setStep] = useState<LoginStep>('email')
  const [email, setEmail] = useState('')
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Paso 1: enviar el código al email
  const sendCode = async (emailToSend: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await sendOtp({ email: emailToSend })
      setEmail(emailToSend)
      setStep('code')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Paso 2: verificar el código y obtener la sesión
  const verifyCode = async (code: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await verifyOtp({ email, code })
      setSession(data)
      setStep('done')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Volver a enviar el código al mismo email
  const resendCode = () => {
    sendCode(email)
  }

  // Volver al paso del email por si se equivocó
  const changeEmail = () => {
    setError(null)
    setStep('email')
  }

  return {
    step,
    email,
    session,
    isLoading,
    error,
    sendCode,
    verifyCode,
    resendCode,
    changeEmail,
  }
}