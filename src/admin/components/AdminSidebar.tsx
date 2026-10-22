import { SITE_NAME } from '../../config/site'
import AdminNav from './AdminNav'

// Sidebar fijo, solo en computador
function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-footer text-white md:flex">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-6">
        <span className="font-extrabold uppercase tracking-widest">{SITE_NAME}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Admin</span>
      </div>
      <AdminNav />
    </aside>
  )
}

export default AdminSidebar