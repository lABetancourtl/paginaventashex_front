import { apiPost } from '../../../api/client'
import type {
  AuthSession,
  PasswordLoginRequest,
  SendOtpRequest,
  VerifyOtpRequest,
} from '../types'

export function sendOtp(request: SendOtpRequest): Promise<boolean> {
  return apiPost<boolean>('/auth/otp/send', request)
}

export function verifyOtp(request: VerifyOtpRequest): Promise<AuthSession> {
  return apiPost<AuthSession>('/auth/otp/verify', request)
}

// NUEVO
export function loginWithPassword(request: PasswordLoginRequest): Promise<AuthSession> {
  return apiPost<AuthSession>('/auth/login', request)
}