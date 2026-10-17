import { useMutation } from '@tanstack/react-query'
import { sendOtp } from '../services/authService'

// Envía un código al email (para acciones que requieren verificación)
export function useSendOtp() {
  return useMutation({
    mutationFn: (email: string) => sendOtp({ email }),
  })
}