import { useState } from 'react'
import { sendOtp } from '../services/authService'

// El login tiene dos pasos: pedir el email y pedir el código
type LoginStep = 'email' | 'code'

export function useOtpLogin() {
  const [step, setStep] = useState<LoginStep>('email')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Se llama cuando el usuario envía el formulario del email
  const sendCode = async (emailToSend: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await sendOtp({ email: emailToSend })
      // Solo si el envío fue exitoso, guardamos el email y avanzamos
      setEmail(emailToSend)
      setStep('code')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return { step, email, isLoading, error, sendCode }
}