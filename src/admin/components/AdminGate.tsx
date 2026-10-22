import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../features/auth/hooks/useAuth'
import LoginPanel from '../../features/auth/components/LoginPanel'
import { secondaryButtonClass } from '../../components/formStyles'

interface AdminGateProps {
  children: ReactNode
}

// Decide qué ve quien entra a /admin: el login, un aviso o el panel
function AdminGate({ children }: AdminGateProps) {
  const { session, logout } = useAuth()

  // ─── Sin sesión: el login, dentro del diseño del panel ────
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
        <div className="w-full max-w-md border border-line bg-surface p-6 md:p-10">
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-ink-muted">
            Panel de administración
          </p>
          <LoginPanel />
        </div>
      </div>
    )
  }

  // ─── Con sesión, pero sin permisos de administrador ───────
  if (session.rol !== 'Admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-lg font-extrabold uppercase tracking-wide">Acceso no permitido</h1>
          <p className="mt-3 text-sm text-ink-muted">
            La cuenta <strong className="break-all text-ink">{session.email}</strong> no tiene
            permisos de administrador.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button type="button" onClick={logout} className={secondaryButtonClass}>
              Ingresar con otra cuenta
            </button>
            <Link to="/" className="text-sm underline underline-offset-4">
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── Administrador: el panel ──────────────────────────────
  return children
}

export default AdminGate