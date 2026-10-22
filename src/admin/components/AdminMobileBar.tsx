import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Modal from '../../components/Modal'
import { SITE_NAME } from '../../config/site'
import AdminNav from './AdminNav'

const iconButtonClass =
  'flex size-10 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-white'

// Barra superior con el menú, solo en celular
function AdminMobileBar() {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => setIsOpen(false)

  const brand = (
    <span className="flex items-center gap-2">
      <span className="text-sm font-extrabold uppercase tracking-widest">{SITE_NAME}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Admin</span>
    </span>
  )

  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-footer px-2 text-white md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú"
        aria-haspopup="dialog"
        className={iconButtonClass}
      >
        <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
      {brand}

      <Modal
        isOpen={isOpen}
        onClose={close}
        ariaLabel="Menú de administración"
        size="fullscreen"
        showCloseButton={false}
      >
        {/* El menú del celular conserva el fondo oscuro del sidebar */}
        <div className="flex min-h-full flex-col bg-footer text-white">
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 px-2">
            <button type="button" onClick={close} aria-label="Cerrar menú" className={iconButtonClass}>
              <X size={22} strokeWidth={1.5} aria-hidden="true" />
            </button>
            {brand}
          </div>
          <AdminNav onNavigate={close} />
        </div>
      </Modal>
    </div>
  )
}

export default AdminMobileBar