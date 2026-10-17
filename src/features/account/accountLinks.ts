import { Flag, LayoutDashboard, Lock, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Rol } from '../auth/types'

interface AccountLink {
  to: string
  label: string
  icon: LucideIcon
}

const baseLinks: AccountLink[] = [
  { to: '/cuenta/perfil', label: 'Perfil', icon: User },
  { to: '/cuenta/direcciones', label: 'Direcciones', icon: Flag },
  { to: '/cuenta/autenticacion', label: 'Autenticación', icon: Lock },
]

// Opciones de la cuenta según el rol del usuario
export function getAccountLinks(rol: Rol | undefined): AccountLink[] {
  if (rol === 'Admin') {
    return [...baseLinks, { to: '/admin', label: 'Administración', icon: LayoutDashboard }]
  }
  return baseLinks
}