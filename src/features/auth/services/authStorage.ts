import type { AuthSession } from '../types'

const STORAGE_KEY = 'pvn_session'

// Guarda la sesión como texto JSON
export function saveSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

// Borra la sesión
export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// ¿Ya pasó la fecha de expiración?
export function isExpired(session: AuthSession): boolean {
  return new Date(session.expiracion).getTime() <= Date.now()
}

// Lee la sesión guardada. Si no existe, está dañada o expiró, retorna null
export function loadSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const session = JSON.parse(raw) as AuthSession

    if (!session.token || !session.expiracion || isExpired(session)) {
      clearSession()
      return null
    }

    return session
  } catch {
    // El texto guardado no es un JSON válido
    clearSession()
    return null
  }
}