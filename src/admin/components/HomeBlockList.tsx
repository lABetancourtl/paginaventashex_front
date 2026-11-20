import { useEffect, useRef } from 'react'
import { GalleryHorizontal, LayoutGrid, Plus } from 'lucide-react'
import AdminSwitch from './AdminSwitch'
import type { AdminCategoryNode } from '../../features/catalog/types'
import type { HomeSectionAdmin } from '../../features/home/types'
import { isCategoryUsable, MAX_BANNER_ITEMS, MAX_SHELF_PRODUCTS, sectionContentCount, sectionDisplayName } from '../homeSections'
import { adminCountChipClass } from '../adminStyles'

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
      <div className="flex items-center gap-2 px-5 pb-3 pt-4">
        <h2 className="text-[15px] font-semibold text-admin-ink">Bloques</h2>
        <span className={adminCountChipClass}>{sections.length}</span>
        <span className="ml-auto truncate text-xs text-[#9a9993]">Orden en la tienda</span>
      </div>

      <ol className="min-h-0 flex-1 overflow-auto">
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
                className={`relative flex items-center gap-2.5 border-t border-admin-row-line py-2.5 pl-4 pr-3 transition-colors ${
                  isSelected ? 'bg-[#f5f7fe] shadow-[inset_3px_0_0_var(--color-admin-accent)]' : 'hover:bg-[#fbfbfa]'
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="w-5 shrink-0 font-mono text-xs tabular-nums text-[#9a9993]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-admin-hover text-[#4a4945]"
                  >
                    <Icon size={15} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    {/* El botón cubre toda la fila (after:inset-0); el interruptor queda encima */}
                    <button
                      type="button"
                      onClick={() => onSelect(section)}
                      aria-current={isSelected ? 'true' : undefined}
                      className={`block w-full truncate text-left text-sm font-semibold after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-admin-accent ${
                        !isBanner && !section.title ? 'italic text-[#8b8a84]' : section.isActive ? 'text-admin-ink' : 'text-[#8b8a84]'
                      }`}
                    >
                      {name}
                    </button>
                    <p className="mt-0.5 truncate text-xs text-[#8b8a84]">
                      {isBanner ? 'Banner' : 'Estante'} ·{' '}
                      <span className={count === 0 ? 'font-medium text-[#8a5a00]' : ''}>
                        {count} de {isBanner ? MAX_BANNER_ITEMS : MAX_SHELF_PRODUCTS}
                        {isBanner ? (count === 1 ? ' medio' : ' medios') : ''}
                      </span>
                      {!isBanner && section.categoryName && (
                        <span className={categoryInactive ? 'text-[#8a5a00]' : ''}>
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
                    tone="ink"
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

      <div className="border-t border-admin-row-line px-4 pb-4 pt-3">
        <button
          type="button"
          onClick={onAdd}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-[#d0cfc9] text-[13px] font-medium text-[#4a4945] transition-colors hover:border-admin-accent hover:text-admin-accent md:h-9"
        >
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          Agregar bloque
        </button>
      </div>

      {/* Los atajos solo funcionan con las tres columnas (pantallas grandes) */}
      <p className="hidden border-t border-admin-row-line px-4 py-2.5 font-mono text-[11px] text-[#9a9993] xl:block">
        ↑↓ moverse · Alt ↑↓ reordenar · H ocultar
      </p>
    </div>
  )
}

export default HomeBlockList
