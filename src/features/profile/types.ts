import type { Rol } from '../auth/types'

// Debe coincidir con el enum Genero del backend
export type Genero = 'Masculino' | 'Femenino' | 'PrefieroNoDecir'

// Perfil tal como lo retorna GET /api/profile
export interface Profile {
  id: number
  email: string
  rol: Rol
  nombre: string | null
  apellido: string | null
  documento: string | null
  genero: Genero | null
  fechaNacimiento: string | null // DateOnly: "2000-05-10"
  telefono: string | null
  tienePassword: boolean
  creadoEn: string
}

// Body de PUT /api/profile
export interface UpdateProfileRequest {
  nombre: string | null
  apellido: string | null
  documento: string | null
  genero: Genero | null
  fechaNacimiento: string | null
  telefono: string | null
}

// Body de PUT /api/profile/password
export interface SetPasswordRequest {
  otpCode: string
  newPassword: string
}