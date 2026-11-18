import { Suspense } from 'react'
import { Outlet, ScrollRestoration, useMatches } from 'react-router'
import AdminGate from '../components/AdminGate'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopBar from '../components/AdminTopBar'
import AdminToaster from '../toast/AdminToaster'
import PageLoader from '../../layouts/PageLoader'
import type { RouteHandle } from '../../routes/routeHandle'

function AdminLayout() {
  // ¿La página pidió todo el espacio, sin márgenes? (ej: el editor de la página de inicio)
  const isFullBleed = useMatches().some((match) => (match.handle as RouteHandle | undefined)?.adminFullBleed)

  return (
    <>
      {/* Fuera de AdminGate: también debe ocultarse en "Verificando acceso" o "Sin permiso" */}
      <PageLoader />
      <AdminGate>
        <AdminToaster>
          <div className="min-h-screen bg-admin-bg">
            <AdminTopBar />
            <AdminSidebar />

            <main className="md:pl-[72px]">
              <div className={isFullBleed ? 'w-full' : 'mx-auto w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 xl:px-8'}>
                {/* Cada página del panel también se carga de forma diferida */}
                <Suspense fallback={<p className="text-sm text-ink-muted">Cargando...</p>}>
                  <Outlet />
                </Suspense>
              </div>
            </main>
          </div>
        </AdminToaster>
        <ScrollRestoration />
      </AdminGate>
    </>
  )
}

export default AdminLayout
