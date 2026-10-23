import { useState } from 'react'
import { SITE_NAME } from '../../config/site'
import { filterActive } from '../../features/catalog/categoryTree'
import { getSaleCategories } from '../../features/catalog/catalogNav'
import type { AdminCategoryNode } from '../../features/catalog/types'

const navItemClass = 'shrink-0 whitespace-nowrap text-xs font-bold uppercase tracking-wider'
const hideScrollbar = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

interface StoreNavPreviewProps {
  tree: AdminCategoryNode[]
}

// Reproduce el menú de la tienda con los datos del panel, en tiempo real
function StoreNavPreview({ tree }: StoreNavPreviewProps) {
  // La misma regla de la tienda: activas y con su principal activa
  const visibleRoots = filterActive(tree)
  const hasSale = getSaleCategories(visibleRoots).length > 0

  // La categoría principal seleccionada en la vista previa
  const [selectedId, setSelectedId] = useState<number | null>(null)

  if (visibleRoots.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-ink-muted">
        No hay categorías visibles en la tienda.
      </p>
    )
  }

  // Si la seleccionada se desactivó o no hay ninguna, se muestra la primera
  const selected = visibleRoots.find((root) => root.id === selectedId) ?? visibleRoots[0]

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      {/* El header de la tienda */}
      <div className={`flex items-center gap-6 overflow-x-auto bg-header/90 px-4 py-3 text-white ${hideScrollbar}`}>
        {visibleRoots.map((root) => (
          <button
            key={root.id}
            type="button"
            onClick={() => setSelectedId(root.id)}
            aria-pressed={root.id === selected.id}
            className={`${navItemClass} text-white/80 hover:text-white focus-visible:outline-white aria-pressed:text-white aria-pressed:underline aria-pressed:underline-offset-8`}
          >
            {root.name}
          </button>
        ))}

        {hasSale && <span className={`${navItemClass} text-sale`}>Sale</span>}

        <span className="ml-auto shrink-0 pl-6 text-sm font-extrabold uppercase tracking-wider">
          {SITE_NAME}
        </span>
      </div>

      {/* La barra de subcategorías de la principal seleccionada */}
      {selected.children.length > 0 ? (
        <ul className={`flex gap-6 overflow-x-auto bg-canvas px-4 ${hideScrollbar}`}>
          <li className={`${navItemClass} py-3 text-ink underline underline-offset-8`}>Todo</li>
          {selected.children.map((child) => (
            <li key={child.id} className={`${navItemClass} py-3 text-ink/60`}>
              {child.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="bg-canvas px-4 py-3 text-xs text-ink-muted">
          {selected.name} no tiene subcategorías visibles.
        </p>
      )}
    </div>
  )
}

export default StoreNavPreview