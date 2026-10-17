export interface NavLinkItem {
  to: string
  label: string
}

// Categorías principales de la tienda.
// En el futuro: obtenerlas de las categorías raíz del backend (por su slug)
export const mainNavLinks: NavLinkItem[] = [
  { to: '/categoria/nino', label: 'Niño' },
  { to: '/categoria/nina', label: 'Niña' },
  { to: '/categoria/accesorios', label: 'Accesorios' },
  { to: '/categoria/basicos', label: 'Básicos' },
  { to: '/categoria/sale', label: 'Sale' },
]