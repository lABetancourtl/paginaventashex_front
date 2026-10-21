import { useState } from 'react'
import { Link } from 'react-router'
import { Menu, Minus, Plus } from 'lucide-react'
import Modal from '../components/Modal'
import ModalTopBar from '../components/ModalTopBar'
import { useCategoryTree } from '../features/catalog/hooks/useCategoryTree'
import { categoryPath, getSaleCategories } from '../features/catalog/catalogNav'
import { headerIconButtonClass } from './headerStyles'

const itemClass =
  'block py-3 text-base font-extrabold uppercase tracking-wide hover:text-ink-muted'

function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaleOpen, setIsSaleOpen] = useState(false)
  const { data: categories, isPending } = useCategoryTree()

  const close = () => {
    setIsOpen(false)
    setIsSaleOpen(false) // La próxima vez, Sale empieza cerrado
  }

  const saleCategories = categories ? getSaleCategories(categories) : []

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
          {isPending ? (
            <p className="text-sm text-ink-muted">Cargando categorías...</p>
          ) : (
            <ul>
              {categories?.map((category) => (
                <li key={category.id}>
                  <Link to={categoryPath(category.slug)} onClick={close} className={itemClass}>
                    {category.name}
                  </Link>
                </li>
              ))}

              {saleCategories.length > 0 && (
                <li>
                  <button
                    type="button"
                    onClick={() => setIsSaleOpen((prev) => !prev)}
                    aria-expanded={isSaleOpen}
                    aria-controls="mobile-sale-options"
                    className="flex w-full items-center justify-between py-3 text-base font-extrabold uppercase tracking-wide text-sale-ink"
                  >
                    Sale
                    {isSaleOpen ? (
                      <Minus size={20} strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </button>

                  {isSaleOpen && (
                    <ul id="mobile-sale-options" className="pb-2 pl-4">
                      {saleCategories.map((category) => (
                        <li key={category.id}>
                          <Link
                            to={categoryPath(category.slug, true)}
                            onClick={close}
                            className="block py-2.5 text-sm font-bold uppercase tracking-wide hover:text-ink-muted"
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )}
            </ul>
          )}
        </nav>
      </Modal>
    </div>
  )
}

export default MobileNav