import { useState } from 'react'
import { Link } from 'react-router'
import { Menu } from 'lucide-react'
import Modal from '../components/Modal'
import ModalTopBar from '../components/ModalTopBar'
import { mainNavLinks } from './mainNavLinks'
import { headerIconButtonClass } from './headerStyles'

function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => setIsOpen(false)

  return (
    <div className="order-1 md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú"
        aria-haspopup="dialog"
        className={headerIconButtonClass}
      >
        <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        ariaLabel="Menú principal"
        size="fullscreen"
        showCloseButton={false}
        topBar={
          <ModalTopBar onClose={close} closeLabel="Cerrar menú">
            <Link to="/" onClick={close}>
              Tisoro
            </Link>
          </ModalTopBar>
        }
      >
        <nav aria-label="Categorías" className="px-6 py-6">
          <ul>
            {mainNavLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={close}
                  className="block py-3 text-base font-extrabold uppercase tracking-wide hover:text-ink-muted"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Modal>
    </div>
  )
}

export default MobileNav