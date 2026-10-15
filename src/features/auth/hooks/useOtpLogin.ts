import { useState } from 'react'
import { sendOtp, verifyOtp } from '../services/authService'
import { useAuth } from './useAuth'

// Ya no necesitamos el paso 'done': la sesión vive en el Context
type LoginStep = 'email' | 'code'

export function useOtpLogin() {
  const { login } = useAuth()

  const [step, setStep] = useState<LoginStep>('email')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const verifyCode = async (code: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await verifyOtp({ email, code })
      login(data)        // Guarda la sesión en el Context y en localStorage
      setStep('email')   // Deja el formulario listo por si cierra sesión
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = () => {
    sendCode(email)
  }

  const changeEmail = () => {
    setError(null)
    setStep('email')
  }

  return {
    step,
    email,
    isLoading,
    error,
    sendCode,
    verifyCode,
    resendCode,
    changeEmail,
  }
}