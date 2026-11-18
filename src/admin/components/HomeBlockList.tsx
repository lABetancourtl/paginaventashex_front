import { useEffect, useRef } from 'react'
import { GalleryHorizontal, LayoutGrid, Plus } from 'lucide-react'
import AdminSwitch from './AdminSwitch'
import type { AdminCategoryNode } from '../../features/catalog/types'
import type { HomeSectionAdmin } from '../../features/home/types'
import { isCategoryUsable, MAX_BANNER_ITEMS, MAX_SHELF_PRODUCTS, sectionContentCount, sectionDisplayName } from '../homeSections'
import { adminSmallButtonClass } from '../adminStyles'

// Rayas de fondo de las miniaturas (como en la vista previa del diseño)
export const stripedTileClass =
  'bg-[repeating-linear-gradient(135deg,var(--color-admin-line)_0_5px,var(--color-admin-bg)_5px_10px)]'

interface HomeBlockListProps {
  sections: HomeSectionAdmin[]
  selectedId: number | undefined
  tree: AdminCategoryNode[] | undefined
  updatingId: number | undefined // Bloque cuyo estado se está guardando
  contentCounts: Map<number, number> // Contenido actual (incluye el borrador del estante)
  onSelect: (section: HomeSectionAdmin) => void
  onToggleStatus: (section: HomeSectionAdmin) => void
  onAdd: () => void
}

// Columna izquierda: los bloques en el orden en que salen en la tienda
function HomeBlockList({
  sections,
  selectedId,
  tree,
  updatingId,
  contentCounts,
  onSelect,
  onToggleStatus,
  onAdd,
}: HomeBlockListProps) {
  const selectedRef = useRef<HTMLLIElement>(null)

  // El bloque elegido (por ejemplo con las flechas) siempre queda a la vista en la lista
  useEffect(() => {
    if (window.matchMedia('(min-width: 80rem)').matches) {
      selectedRef.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedId])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pb-2.5 pt-4">
        <h2 className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">
          Bloques · orden en la tienda
        </h2>
        <button type="button" onClick={onAdd} className={`${adminSmallButtonClass} h-7`}>
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          Agregar
        </button>
      </div>

      <ol className="flex-1 space-y-1 overflow-auto px-2 pb-4">
        {sections.map((section, index) => {
          const isSelected = section.id === selectedId
          const isBanner = section.type === 'Banner'
          const Icon = isBanner ? GalleryHorizontal : LayoutGrid
          const count = contentCounts.get(section.id) ?? sectionContentCount(section)
          const name = sectionDisplayName(section)
          const categoryInactive = !isBanner && section.categoryId !== null && !isCategoryUsable(tree, section.categoryId)

          return (
            <li key={section.id} ref={isSelected ? selectedRef : undefined}>
              <div
                className={`relative flex items-center gap-2.5 rounded-[10px] border p-2.5 transition-colors ${
                  isSelected ? 'border-admin-accent bg-admin-accent/[0.06]' : 'border-transparent hover:bg-admin-bg'
                }`}
              >
                <div className={`flex min-w-0 flex-1 items-center gap-2.5 ${section.isActive ? '' : 'opacity-55'}`}>
                  <span className="w-3.5 shrink-0 text-right font-mono text-xs tabular-nums text-ink-muted/80">
                    {index + 1}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-8 w-11 shrink-0 items-center justify-center rounded-[5px] text-ink-muted ${stripedTileClass}`}
                  >
                    <Icon size={15} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    {/* El botón cubre toda la fila (after:inset-0); el interruptor queda encima */}
                    <button
                      type="button"
                      onClick={() => onSelect(section)}
                      aria-current={isSelected ? 'true' : undefined}
                      className={`block w-full truncate text-left text-sm font-semibold after:absolute after:inset-0 after:rounded-[10px] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-admin-accent ${
                        !isBanner && !section.title ? 'italic text-ink-muted' : 'text-ink'
                      }`}
                    >
                      {name}
                    </button>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      {isBanner ? 'Banner' : 'Estante'} ·{' '}
                      <span className={count === 0 ? 'font-medium text-amber-700' : ''}>
                        {count} de {isBanner ? MAX_BANNER_ITEMS : MAX_SHELF_PRODUCTS}
                        {isBanner ? (count === 1 ? ' medio' : ' medios') : ''}
                      </span>
                      {!isBanner && section.categoryName && (
                        <span className={categoryInactive ? 'text-amber-700' : ''}>
                          {' '}
                          · Ver todo: {section.categoryName}
                          {categoryInactive && ' (inactiva)'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex">
                  <AdminSwitch
                    size="sm"
                    checked={section.isActive}
                    disabled={updatingId === section.id}
                    label={section.isActive ? `Ocultar ${name} de la tienda` : `Mostrar ${name} en la tienda`}
                    onChange={() => onToggleStatus(section)}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {/* Los atajos solo funcionan con las tres columnas (pantallas grandes) */}
      <p className="hidden border-t border-admin-line px-4 py-2.5 font-mono text-xs text-ink-muted/80 xl:block">
        ↑↓ moverse · Alt ↑↓ reordenar · H ocultar
      </p>
    </div>
  )
}

export default HomeBlockList
