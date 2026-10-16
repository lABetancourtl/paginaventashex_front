import { Link, Outlet } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'
import LoginModal from '../features/auth/components/LoginModal'
import UserMenu from '../features/account/components/UserMenu'

function MainLayout() {
  const { session } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16">
          <div className="flex items-center gap-10">
            <Link to="/" className="text-sm font-extrabold uppercase tracking-wider md:text-base">
              PaginaVentasNet
            </Link>

          <nav aria-label="Principal" className="hidden items-center gap-6 md:flex">
            <Link to="/" className="text-sm font-medium uppercase tracking-wide hover:text-ink-muted">
              Inicio
            </Link>
            {session?.rol === 'Admin' && (
              <Link to="/admin" className="text-sm font-medium uppercase tracking-wide hover:text-ink-muted">
                Administración
              </Link>
            )}
          </nav>
      </div>

          <UserMenu />
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