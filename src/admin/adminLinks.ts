import { FolderTree, LayoutDashboard, Package, Receipt } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface AdminLink {
  to: string
  label: string
  description: string
  icon: LucideIcon
  end?: boolean // Solo se marca activo en esa ruta exacta
}

export const adminLinks: AdminLink[] = [
  {
    to: '/admin',
    label: 'Dashboard',
    description: 'Resumen de la tienda.',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/admin/productos',
    label: 'Productos',
    description: 'Crea, edita y organiza los productos del catálogo.',
    icon: Package,
  },
  {
    to: '/admin/categorias',
    label: 'Categorías',
    description: 'Gestiona las categorías y subcategorías de la tienda.',
    icon: FolderTree,
  },
  {
    to: '/admin/pedidos',
    label: 'Pedidos',
    description: 'Revisa los pedidos y cambia su estado.',
    icon: Receipt,
  },
]