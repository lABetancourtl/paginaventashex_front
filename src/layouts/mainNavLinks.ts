import type { Rol } from '../features/auth/types'

interface NavLinkItem {
  to: string
  label: string
}

// Enlaces de la navegación principal.
// En el futuro: categorías principales (Hombre, Mujer, Ofertas...)
export function getMainNavLinks(rol: Rol | undefined): NavLinkItem[] {
  const links: NavLinkItem[] = [{ to: '/', label: 'Inicio' }]

  if (rol === 'Admin') {
    links.push({ to: '/admin', label: 'Administración' })
  }

  return links
}