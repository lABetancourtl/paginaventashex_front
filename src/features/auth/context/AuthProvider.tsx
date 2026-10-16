import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AuthContext } from './AuthContext'
import { clearSession, loadSession, saveSession } from '../services/authStorage'
import { setUnauthorizedHandler } from '../../../api/client'
import type { AuthSession } from '../types'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<AuthSession | null>(() => loadSession())
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const login = (newSession: AuthSession) => {
    queryClient.clear() // NUEVO: sin datos de una sesión anterior
    saveSession(newSession)
    setSession(newSession)
    setIsLoginOpen(false)
  }

  const logout = () => {
    clearSession()
    setSession(null)
    queryClient.clear() // NUEVO: borra los datos del usuario
  }

  const openLogin = () => setIsLoginOpen(true)
  const closeLogin = () => setIsLoginOpen(false)

  // Cierra la sesión automáticamente cuando el token expira
  useEffect(() => {
    if (!session) return

    const msLeft = new Date(session.expiracion).getTime() - Date.now()

    const timer = setTimeout(() => {
      clearSession()
      setSession(null)
      queryClient.clear()
    }, msLeft)

    return () => clearTimeout(timer)
  }, [session, queryClient])

  // Qué hacer cuando el backend responde 401 a una petición con token
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
      setSession(null)
      queryClient.clear()
      setIsLoginOpen(true)
    })

    return () => setUnauthorizedHandler(null)
  }, [queryClient])

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