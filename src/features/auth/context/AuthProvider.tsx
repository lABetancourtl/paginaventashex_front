import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import { clearSession, loadSession, saveSession } from '../services/authStorage'
import { setUnauthorizedHandler } from '../../../api/client'
import type { AuthSession } from '../types'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession())
  const [isLoginOpen, setIsLoginOpen] = useState(false) // NUEVO

  const login = (newSession: AuthSession) => {
    saveSession(newSession)
    setSession(newSession)
    setIsLoginOpen(false) // NUEVO: al iniciar sesión, el modal se cierra solo
  }

  const logout = () => {
    clearSession()
    setSession(null)
  }

  // NUEVO
  const openLogin = () => setIsLoginOpen(true)
  const closeLogin = () => setIsLoginOpen(false)

  // Cierra la sesión automáticamente cuando el token expira
  useEffect(() => {
    if (!session) return

    const msLeft = new Date(session.expiracion).getTime() - Date.now()

    const timer = setTimeout(() => {
      clearSession()
      setSession(null)
    }, msLeft)

    return () => clearTimeout(timer)
  }, [session])

  // Qué hacer cuando el backend responde 401
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
      setSession(null)
      setIsLoginOpen(true) // NUEVO: invita a iniciar sesión de nuevo
    })

    return () => setUnauthorizedHandler(null)
  }, [])

  const value = {
    session,
    isAuthenticated: session !== null,
    login,
    logout,
    isLoginOpen,
    openLogin,
    closeLogin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}