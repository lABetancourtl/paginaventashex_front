import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Menu as MenuHeadless, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ExternalLink, FolderPlus, LayoutTemplate, LogOut, Menu, Package, Plus, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Modal from '../../components/Modal'
import ModalTopBar from '../../components/ModalTopBar'
import UserAvatar from '../../components/UserAvatar'
import { useAuth } from '../../features/auth/hooks/useAuth'
import AdminNav from './AdminNav'
import { AdminBrand } from './AdminSidebar'
import {
  adminIconButtonClass,
  adminMenuIconTileClass,
  adminMenuItemClass,
  adminMenuPanelClass,
} from '../adminStyles'

interface CreateOption {
  label: string
  description: string
  icon: LucideIcon
  to: string
}

// Opciones del botón "Crear"
const createOptions: CreateOption[] = [
  { label: 'Producto', description: 'Con variantes, precio e imágenes', icon: Package, to: '/admin/productos/nuevo' },
  { label: 'Categoría', description: 'Principal o subcategoría', icon: FolderPlus, to: '/admin/categorias' },
  { label: 'Bloque de inicio', description: 'Banner o estante de productos', icon: LayoutTemplate, to: '/admin/inicio' },
]

// Menú desplegable del botón "Crear"
function CreateMenu() {
  return (
    <MenuHeadless>
      <MenuButton
        aria-label="Crear"
        className="inline-flex h-[38px] min-w-[38px] items-center justify-center gap-1.5 rounded-[9px] bg-admin-accent px-0 text-sm font-medium text-white transition-colors hover:bg-admin-accent-hover data-open:bg-admin-accent-hover sm:px-3.5"
      >
        <Plus size={16} strokeWidth={2} aria-hidden="true" />
        <span className="hidden sm:inline">Crear</span>
      </MenuButton>
      <MenuItems anchor={{ to: 'bottom end', gap: 8 }} className={`${adminMenuPanelClass} w-[280px]`}>
        {createOptions.map(({ label, description, icon: Icon, to }) => (
          <MenuItem key={label}>
            <Link
              to={to}
              className="flex min-h-12 w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left data-focus:bg-[#f4f3ef]"
            >
              <span className={adminMenuIconTileClass}>
                <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium text-admin-ink">{label}</span>
                <span className="text-xs text-[#8b8a84]">{description}</span>
              </span>
            </Link>
          </MenuItem>
        ))}
      </MenuItems>
    </MenuHeadless>
  )
}

// Barra superior del panel: buscador de productos, accesos y cuenta
function AdminTopBar() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const [query, setQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)

  // El buscador lleva a la lista de productos filtrada
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = query.trim()
    navigate(value ? `/admin/productos?q=${encodeURIComponent(value)}` : '/admin/productos')
    setQuery('')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2.5 border-b border-admin-line bg-white px-3 md:px-6">
      <button
        type="button"
        onClick={() => setIsMenuOpen(true)}
        aria-label="Abrir menú"
        aria-haspopup="dialog"
        className={`${adminIconButtonClass} size-10 md:hidden`}
      >
        <Menu size={20} strokeWidth={1.6} aria-hidden="true" />
      </button>

      {/* En computador la marca va en el menú lateral */}
      <Link to="/admin" aria-label="Ir al dashboard" className="shrink-0 md:hidden">
        <AdminBrand />
      </Link>

      <form role="search" onSubmit={handleSearch} className="hidden max-w-[460px] flex-1 md:block">
        <label htmlFor="admin-global-search" className="sr-only">
          Buscar productos
        </label>
        <div className="relative">
          <Search
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8a84]"
          />
          <input
            id="admin-global-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos por nombre…"
            className="h-[38px] w-full rounded-[9px] border border-admin-line bg-admin-bg pl-9 pr-3 text-sm text-admin-ink placeholder:text-[#8b8a84] transition-[border-color,box-shadow,background-color] hover:border-[#d6d5cf] focus:border-admin-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-admin-accent/10"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ver tienda (se abre en otra pestaña)"
          className="hidden h-[38px] items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3 text-sm font-medium text-[#3d3c38] transition-colors hover:bg-admin-hover sm:flex"
        >
          <ExternalLink size={16} strokeWidth={1.75} aria-hidden="true" />
          Ver tienda
        </a>

        <CreateMenu />

        {session && (
          <MenuHeadless>
            <MenuButton
              aria-label="Menú de la cuenta"
              className="ml-1 rounded-full ring-2 ring-transparent transition hover:ring-admin-line data-open:ring-admin-accent/30"
            >
              <UserAvatar seed={session.email} size={34} className="ring-1 ring-admin-line" />
            </MenuButton>
            <MenuItems anchor={{ to: 'bottom end', gap: 8 }} className={`${adminMenuPanelClass} w-64`}>
              <div className="mb-1 border-b border-admin-row-line px-2.5 pb-2.5 pt-1.5">
                <p className="text-xs text-[#8b8a84]">Sesión iniciada como</p>
                <p className="truncate text-sm font-medium text-admin-ink">{session.email}</p>
              </div>
              <MenuItem>
                <Link to="/" className={adminMenuItemClass}>
                  <ExternalLink size={15} strokeWidth={1.75} aria-hidden="true" className="text-[#6b6a65]" />
                  Ir a la tienda
                </Link>
              </MenuItem>
              <MenuItem>
                <button type="button" onClick={logout} className={adminMenuItemClass}>
                  <LogOut size={15} strokeWidth={1.75} aria-hidden="true" className="text-[#6b6a65]" />
                  Cerrar sesión
                </button>
              </MenuItem>
            </MenuItems>
          </MenuHeadless>
        )}
      </div>

      {/* Menú del celular */}
      <Modal
        isOpen={isMenuOpen}
        onClose={closeMenu}
        ariaLabel="Menú de administración"
        size="fullscreen"
        showCloseButton={false}
        topBar={
          <ModalTopBar onClose={closeMenu} closeLabel="Cerrar menú">
            Administración
          </ModalTopBar>
        }
      >
        <div className="flex min-h-full flex-col">
          <AdminNav onNavigate={closeMenu} />
        </div>
      </Modal>
    </header>
  )
}

export default AdminTopBar
