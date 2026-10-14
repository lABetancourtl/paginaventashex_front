import { apiPost } from '../../../api/client'
import type { AuthSession, SendOtpRequest, VerifyOtpRequest } from '../types'

// Envía el código de 6 dígitos al email
export function sendOtp(request: SendOtpRequest): Promise<boolean> {
  return apiPost<boolean>('/auth/otp/send', request)
}

// Verifica el código y retorna la sesión (token, email, rol, expiración)
export function verifyOtp(request: VerifyOtpRequest): Promise<AuthSession> {
  return apiPost<AuthSession>('/auth/otp/verify', request)
}