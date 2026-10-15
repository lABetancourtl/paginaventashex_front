export type Rol = 'Cliente' | 'Admin'

// Body de POST /api/auth/otp/send
export interface SendOtpRequest {
  email: string
}

// Body de POST /api/auth/otp/verify
export interface VerifyOtpRequest {
  email: string
  code: string
}

// NUEVO: body de POST /api/auth/login
export interface PasswordLoginRequest {
  email: string
  password: string
}

// Lo que retornan /otp/verify y /login en "data"
export interface AuthSession {
  token: string
  email: string
  rol: Rol
  expiracion: string
}