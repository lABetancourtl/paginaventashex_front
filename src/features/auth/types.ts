// Roles posibles (deben coincidir con el enum Rol del backend)
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

// Lo que retorna POST /api/auth/otp/verify en "data"
export interface AuthSession {
  token: string
  email: string
  rol: Rol
  expiracion: string
}