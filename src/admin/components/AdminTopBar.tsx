import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Menu as MenuHeadless, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ExternalLink, LogOut, Menu, Plus, Search } from 'lucide-react'
import Modal from '../../components/Modal'
import ModalTopBar from '../../components/ModalTopBar'
import UserAvatar from '../../components/UserAvatar'
import { useAuth } from '../../features/auth/hooks/useAuth'
import AdminNav from './AdminNav'
import { AdminBrand } from './AdminSidebar'
import { adminIconButtonClass } from '../adminStyles'

const menuItemClass =
  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-ink data-focus:bg-admin-bg'

// Barra superior del panel: marca, buscador de productos y cuenta
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-admin-line bg-white/90 px-3 backdrop-blur-md md:px-6">
      <button
        type="button"
        onClick={() => setIsMenuOpen(true)}
        aria-label="Abrir menú"
        aria-haspopup="dialog"
        className={`${adminIconButtonClass} size-10 md:hidden`}
      >
        <Menu size={20} strokeWidth={1.6} aria-hidden="true" />
      </button>

      <Link to="/admin" aria-label="Ir al dashboard" className="shrink-0 md:w-[184px]">
        <AdminBrand />
      </Link>

      <form role="search" onSubmit={handleSearch} className="hidden max-w-md flex-1 md:block">
        <label htmlFor="admin-global-search" className="sr-only">
          Buscar productos
        </label>
        <div className="relative">
          <Search
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            id="admin-global-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos por nombre…"
            className="h-10 w-full rounded-lg border border-admin-line bg-admin-bg pl-9 pr-3 text-sm placeholder:text-ink-muted/70 transition-[border-color,box-shadow,background-color] focus:border-admin-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-admin-accent/10"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Link
          to="/admin/productos/nuevo"
          aria-label="Nuevo producto"
          title="Nuevo producto"
          className="flex size-10 items-center justify-center rounded-lg border border-admin-line text-ink-muted transition-colors hover:bg-admin-bg hover:text-ink"
        >
          <Plus size={18} strokeWidth={2} aria-hidden="true" />
        </Link>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ver la tienda (se abre en otra pestaña)"
          title="Ver la tienda"
          className="hidden size-10 items-center justify-center rounded-lg border border-admin-line text-ink-muted transition-colors hover:bg-admin-bg hover:text-ink sm:flex"
        >
          <ExternalLink size={17} strokeWidth={1.6} aria-hidden="true" />
        </a>

        {session && (
          <MenuHeadless>
            <MenuButton
              aria-label="Menú de la cuenta"
              className="ml-1 rounded-full ring-2 ring-transparent transition hover:ring-admin-line data-open:ring-admin-accent/30"
            >
              <UserAvatar seed={session.email} size={38} className="ring-1 ring-admin-line" />
            </MenuButton>
            <MenuItems
              anchor={{ to: 'bottom end', gap: 8 }}
              className="z-40 w-64 animate-admin-fade rounded-xl border border-admin-line bg-white p-1 shadow-lg shadow-black/5 focus:outline-none"
            >
              <div className="border-b border-admin-line px-3 py-2.5">
                <p className="text-xs text-ink-muted">Sesión iniciada como</p>
                <p className="truncate text-sm font-medium">{session.email}</p>
              </div>
              <div className="pt-1">
                <MenuItem>
                  <Link to="/" className={menuItemClass}>
                    <ExternalLink size={15} strokeWidth={1.75} aria-hidden="true" className="text-ink-muted" />
                    Ir a la tienda
                  </Link>
                </MenuItem>
                <MenuItem>
                  <button type="button" onClick={logout} className={menuItemClass}>
                    <LogOut size={15} strokeWidth={1.75} aria-hidden="true" className="text-ink-muted" />
                    Cerrar sesión
                  </button>
                </MenuItem>
              </div>
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
