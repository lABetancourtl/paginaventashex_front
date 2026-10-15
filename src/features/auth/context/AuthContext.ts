import { createContext } from 'react'
import type { AuthSession } from '../types'

export interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (session: AuthSession) => void
  logout: () => void
  // NUEVO: control del modal de login
  isLoginOpen: boolean
  openLogin: () => void
  closeLogin: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)