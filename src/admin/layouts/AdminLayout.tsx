import { Suspense, useState } from 'react'
import type { CSSProperties } from 'react'
import { Outlet, ScrollRestoration, useMatches } from 'react-router'
import AdminGate from '../components/AdminGate'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopBar from '../components/AdminTopBar'
import AdminToaster from '../toast/AdminToaster'
import PageLoader from '../../layouts/PageLoader'
import type { RouteHandle } from '../../routes/routeHandle'

const COLLAPSED_KEY = 'admin-sidebar-collapsed'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

function AdminLayout() {
  // ¿La página pidió todo el espacio, sin márgenes? (ej: el editor de la página de inicio)
  const isFullBleed = useMatches().some((match) => (match.handle as RouteHandle | undefined)?.adminFullBleed)

  // El menú lateral recuerda si el admin lo dejó colapsado
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        // Sin almacenamiento: solo dura esta sesión
      }
      return next
    })
  }

  // Ancho del menú lateral; lo usan también las barras fijas de las páginas
  const layoutStyle = { '--admin-sidebar-w': collapsed ? '64px' : '232px' } as CSSProperties

  return (
    <>
      {/* Fuera de AdminGate: también debe ocultarse en "Verificando acceso" o "Sin permiso" */}
      <PageLoader />
      <AdminGate>
        <AdminToaster>
          <div style={layoutStyle} className="min-h-screen bg-admin-bg text-admin-ink md:flex md:items-start">
            <AdminSidebar collapsed={collapsed} onToggle={toggleCollapsed} />

            <div className="min-w-0 flex-1">
              <AdminTopBar />
              <main>
                <div className={isFullBleed ? 'w-full' : 'mx-auto w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 xl:px-8'}>
                  {/* Cada página del panel también se carga de forma diferida */}
                  <Suspense fallback={<p className="text-sm text-ink-muted">Cargando...</p>}>
                    <Outlet />
                  </Suspense>
                </div>
              </main>
            </div>
          </div>
        </AdminToaster>
        <ScrollRestoration />
      </AdminGate>
    </>
  )
}

export default AdminLayout
