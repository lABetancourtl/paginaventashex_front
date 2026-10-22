import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import AdminGate from '../components/AdminGate'
import AdminSidebar from '../components/AdminSidebar'
import AdminMobileBar from '../components/AdminMobileBar'

function AdminLayout() {
  return (
    <AdminGate>
      <div className="min-h-screen bg-canvas md:pl-60">
        <AdminSidebar />
        <AdminMobileBar />

        <main className="px-4 py-6 md:px-10 md:py-10">
          {/* Cada página del panel también se carga de forma diferida */}
          <Suspense fallback={<p className="text-sm text-ink-muted">Cargando...</p>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <ScrollRestoration />
    </AdminGate>
  )
}

export default AdminLayout