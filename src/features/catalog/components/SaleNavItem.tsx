import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { Link } from 'react-router'
import { useDismiss } from '../../../hooks/useDismiss'
import { headerNavLinkClass, headerSaleClass } from '../../../layouts/headerStyles'
import { categoryPath, getSaleCategories } from '../catalogNav'
import type { CategoryTreeNode } from '../types'

interface SaleNavItemProps {
  categories: CategoryTreeNode[]
  isSaleView: boolean
  activeRootId: number | undefined
}

function SaleNavItem({ categories, isSaleView, activeRootId }: SaleNavItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const close = () => setIsOpen(false)
  useDismiss(containerRef, isOpen, close)

  // Solo con mouse real: en pantallas táctiles, el toque ya dispara el clic
  const handlePointerEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') setIsOpen(true)
  }
  const handlePointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') setIsOpen(false)
  }

  const saleCategories = getSaleCategories(categories)
  if (saleCategories.length === 0) return null

  return (
    <div
      ref={containerRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="flex items-center gap-3"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="sale-options"
        aria-current={isSaleView ? 'true' : undefined}
        className={headerSaleClass}
      >
        Sale
      </button>

      {/* Las opciones aparecen al lado, como en la referencia: NIÑO | NIÑA */}
      {isOpen && (
        <ul id="sale-options" className="flex items-center">
          {saleCategories.map((category, index) => (
            <li
              key={category.id}
              className={index > 0 ? 'ml-3 border-l border-white/40 pl-3' : undefined}
            >
              <Link
                to={categoryPath(category.slug, true)}
                onClick={close}
                aria-current={isSaleView && category.id === activeRootId ? 'true' : undefined}
                className={headerNavLinkClass}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SaleNavItem