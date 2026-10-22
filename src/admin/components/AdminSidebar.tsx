import { SITE_NAME } from '../../config/site'
import AdminNav from './AdminNav'

export function AdminBrand() {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="flex size-7 items-center justify-center rounded-md bg-ink text-xs font-extrabold text-white"
      >
        {SITE_NAME.charAt(0)}
      </span>
      <span className="font-bold tracking-wide">{SITE_NAME}</span>
      <span className="rounded bg-line px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
        Admin
      </span>
    </span>
  )
}

// Sidebar fijo, solo en computador
function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-canvas md:flex">
      <div className="flex h-16 shrink-0 items-center px-6">
        <AdminBrand />
      </div>
      <AdminNav />
    </aside>
  )
}

export default AdminSidebar