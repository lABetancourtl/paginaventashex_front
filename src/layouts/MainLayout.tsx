import { Link, Outlet } from 'react-router'
import { Search, ShoppingBag } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'
import LoginModal from '../features/auth/components/LoginModal'
import UserMenu from '../features/account/components/UserMenu'
import MobileNav from './MobileNav'
import { getMainNavLinks } from './mainNavLinks'
import { headerIconButtonClass, headerNavLinkClass } from './headerStyles'

function MainLayout() {
  const { session } = useAuth()
  const links = getMainNavLinks(session?.rol)

  return (
        // pt-14: espacio arriba del contenido, igual a la altura del header fijo
    <div className="min-h-screen pt-14">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 text-white glass-dark">
        <div className="flex h-14 items-center gap-1 px-2 md:gap-2 md:px-6">
          {/* Celular: hamburguesa a la izquierda */}
          <MobileNav />

          {/* Computador: navegación a la izquierda, ocupando la mitad del espacio libre */}
          <nav aria-label="Principal" className="hidden md:flex md:flex-1 md:items-center md:gap-7">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className={headerNavLinkClass}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Logo: centrado en celular y en computador */}
          <Link
            to="/"
            className="order-3 flex-1 text-center text-sm font-extrabold uppercase tracking-wider focus-visible:outline-white md:order-none md:flex-none md:text-base"
          >
            Tisoro
          </Link>

          {/* Celular: el contenedor "desaparece" y cada ícono tiene su propio orden.
              Computador: es un grupo a la derecha, ocupando la otra mitad del espacio libre */}
          <div className="contents md:flex md:flex-1 md:items-center md:justify-end md:gap-1">
            <div className="order-2 md:order-none">
              <UserMenu />
            </div>

            {/* Funcionalidad futura */}
            <button
              type="button"
              aria-label="Buscar"
              className={`order-4 md:order-none ${headerIconButtonClass}`}
            >
              <Search size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label="Carrito de compras"
              className={`order-5 md:order-none ${headerIconButtonClass}`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <Outlet />
      </main>

      <LoginModal />
    </div>
  )
}

export default MainLayout