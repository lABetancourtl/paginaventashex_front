import { useState } from 'react'
import { Menu } from 'lucide-react'
import Modal from '../../components/Modal'
import ModalTopBar from '../../components/ModalTopBar'
import AdminNav from './AdminNav'
import { AdminBrand } from './AdminSidebar'

// Barra superior con el menú, solo en celular
function AdminMobileBar() {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => setIsOpen(false)

  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-canvas/90 px-2 backdrop-blur-md md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú"
        aria-haspopup="dialog"
        className="flex size-10 items-center justify-center rounded-full hover:bg-line/50"
      >
        <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <AdminBrand />

      <Modal
        isOpen={isOpen}
        onClose={close}
        ariaLabel="Menú de administración"
        size="fullscreen"
        showCloseButton={false}
        topBar={
          <ModalTopBar onClose={close} closeLabel="Cerrar menú">
            Administración
          </ModalTopBar>
        }
      >
        <div className="flex min-h-full flex-col">
          <AdminNav onNavigate={close} />
        </div>
      </Modal>
    </div>
  )
}

export default AdminMobileBar