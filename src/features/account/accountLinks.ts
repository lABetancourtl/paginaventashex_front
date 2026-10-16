import { Flag, Lock, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface AccountLink {
  to: string
  label: string
  icon: LucideIcon
}

// Opciones de "Mi cuenta", usadas en el menú lateral y en el menú del header
export const accountLinks: AccountLink[] = [
  { to: '/cuenta/perfil', label: 'Perfil', icon: User },
  { to: '/cuenta/direcciones', label: 'Direcciones', icon: Flag },
  { to: '/cuenta/autenticacion', label: 'Autenticación', icon: Lock },
]