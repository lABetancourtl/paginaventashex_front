import { useState } from 'react'
import { Search, ShoppingBag, User } from 'lucide-react'
import { SITE_NAME } from '../../config/site'
import { filterActive } from '../../features/catalog/categoryTree'
import { getSaleCategories } from '../../features/catalog/catalogNav'
import { headerIconButtonClass, headerNavLinkClass, headerSaleClass } from '../../layouts/headerStyles'
import type { AdminCategoryNode } from '../../features/catalog/types'

// Mismas clases que la barra de subcategorías de la tienda (CategorySubnav)
const subnavItemClass = [
  'block whitespace-nowrap py-3 text-xs font-bold uppercase tracking-wider text-ink/60',
  'aria-[current=true]:text-ink aria-[current=true]:underline aria-[current=true]:underline-offset-8',
].join(' ')
const hideScrollbar = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

interface StoreNavPreviewProps {
  tree: AdminCategoryNode[]
}

// Copia del header de la tienda (MainLayout + CategorySubnav + SaleNavItem) con los datos del panel
function StoreNavPreview({ tree }: StoreNavPreviewProps) {
  // La misma regla de la tienda: activas y con su principal activa
  const visibleRoots = filterActive(tree)
  const saleCategories = getSaleCategories(visibleRoots)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isSaleOpen, setIsSaleOpen] = useState(false)

  if (visibleRoots.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-admin-line px-4 py-6 text-center text-sm text-ink-muted">
        No hay categorías visibles en la tienda.
      </p>
    )
  }

  // Si la elegida se desactivó o no hay ninguna, se muestra la primera
  const selected = visibleRoots.find((root) => root.id === selectedId) ?? visibleRoots[0]

  const selectRoot = (id: number) => {
    setSelectedId(id)
    setIsSaleOpen(false)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-admin-line bg-canvas shadow-sm">
      {/* Marco de navegador, para que se lea como una vista previa */}
      <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-admin-line bg-admin-bg px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 truncate rounded-md bg-white px-3 py-0.5 font-mono text-[11px] text-ink-muted ring-1 ring-admin-line">
          {window.location.host}/categoria/{selected.slug}
        </span>
      </div>

      {/* Header de la tienda */}
      <div className="glass-dark text-white">
        <div className="flex h-14 items-center gap-2 px-6">
          <nav
            aria-label="Vista previa del menú"
            className={`flex flex-1 items-center gap-7 overflow-x-auto py-2 ${hideScrollbar}`}
          >
            {visibleRoots.map((root) => (
              <button
                key={root.id}
                type="button"
                onClick={() => selectRoot(root.id)}
                aria-current={!isSaleOpen && root.id === selected.id ? 'true' : undefined}
                className={`${headerNavLinkClass} shrink-0 whitespace-nowrap`}
              >
                {root.name}
              </button>
            ))}

            {saleCategories.length > 0 && (
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSaleOpen((open) => !open)}
                  aria-expanded={isSaleOpen}
                  aria-current={isSaleOpen ? 'true' : undefined}
                  className={headerSaleClass}
                >
                  Sale
                </button>
                {isSaleOpen && (
                  <ul className="flex items-center">
                    {saleCategories.map((category, index) => (
                      <li key={category.id} className={index > 0 ? 'ml-3 border-l border-white/40 pl-3' : undefined}>
                        <span className={headerNavLinkClass}>{category.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </nav>

          <span className="shrink-0 text-base font-extrabold uppercase tracking-wider">{SITE_NAME}</span>

          <div aria-hidden="true" className="flex flex-1 items-center justify-end gap-1">
            <span className={headerIconButtonClass}>
              <User size={20} strokeWidth={1.5} />
            </span>
            <span className={headerIconButtonClass}>
              <Search size={20} strokeWidth={1.5} />
            </span>
            <span className={headerIconButtonClass}>
              <ShoppingBag size={20} strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </div>

      {/* Barra de subcategorías de la principal elegida, como al entrar en ella */}
      {selected.children.length > 0 ? (
        <ul className={`flex gap-8 overflow-x-auto border-b border-line px-6 ${hideScrollbar}`}>
          <li className="shrink-0">
            <span aria-current="true" className={subnavItemClass}>
              Todo
            </span>
          </li>
          {selected.children.map((child) => (
            <li key={child.id} className="shrink-0">
              <span className={subnavItemClass}>
                {child.name}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-b border-line px-6 py-3 text-xs text-ink-muted">
          {selected.name} no tiene subcategorías visibles: en la tienda no aparece esta barra.
        </p>
      )}

    </div>
  )
}

export default StoreNavPreview
