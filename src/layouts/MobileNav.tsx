import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useDismiss } from '../hooks/useDismiss'
import { getMainNavLinks } from './mainNavLinks'
import { headerIconButtonClass, headerPanelClass } from './headerStyles'

function MobileNav() {
  const { session } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const close = () => setIsOpen(false)
  useDismiss(containerRef, isOpen, close)

  const links = getMainNavLinks(session?.rol)

  return (
    // Solo existe en celular; en computador la navegación está siempre visible
    <div ref={containerRef} className="order-1 md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="mobile-nav"
        aria-label="Menú"
        className={headerIconButtonClass}
      >
        {isOpen ? (
          <X size={22} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Menu size={22} strokeWidth={1.5} aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <nav id="mobile-nav" aria-label="Principal" className={headerPanelClass}>
          <ul className="py-2">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={close}
                  className="block px-5 py-3.5 text-sm font-semibold uppercase tracking-wide hover:bg-white/10 focus-visible:outline-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}

export default MobileNav