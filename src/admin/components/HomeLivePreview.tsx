import { useEffect, useRef } from 'react'
import { SITE_NAME } from '../../config/site'
import HomeBanner from '../../features/home/components/HomeBanner'
import HomeShelf from '../../features/home/components/HomeShelf'
import type { AdminCategoryNode } from '../../features/catalog/types'
import type { HomeItemAdmin, HomeSectionAdmin } from '../../features/home/types'
import { isCategoryUsable, sectionDisplayName } from '../homeSections'
import type { ShelfProduct } from '../homeSections'
import { stripedTileClass } from './HomeBlockList'

// Contenido de cada bloque: undefined mientras carga
export interface PreviewContent {
  items: Map<number, HomeItemAdmin[] | undefined>
  products: Map<number, ShelfProduct[] | undefined>
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="px-4 md:px-10">
      <p className={`rounded-md px-4 py-10 text-center font-mono text-xs text-ink-muted ${stripedTileClass}`}>{text}</p>
    </div>
  )
}

function BlockContent({
  section,
  content,
  tree,
}: {
  section: HomeSectionAdmin
  content: PreviewContent
  tree: AdminCategoryNode[]
}) {
  if (section.type === 'Banner') {
    const items = content.items.get(section.id)
    if (!items) return <div className="mx-4 h-40 animate-pulse rounded-md bg-admin-bg md:mx-10" />
    if (items.length === 0) return <EmptyBlock text="Banner sin imágenes ni videos" />
    return (
      <HomeBanner
        items={items.map((item) => ({
          id: item.id,
          url: item.url,
          mediaType: item.mediaType,
          // Con la categoría inactiva, la tienda conserva la imagen y quita el enlace
          categorySlug: isCategoryUsable(tree, item.categoryId) ? item.categorySlug : null,
          categoryName: item.categoryName,
        }))}
      />
    )
  }

  const products = content.products.get(section.id)
  if (!products) return <div className="mx-4 h-56 animate-pulse rounded-md bg-admin-bg md:mx-10" />
  const visible = products.filter((product) => product.isVisible !== false)
  if (visible.length === 0) return <EmptyBlock text={`${sectionDisplayName(section)} · sin productos visibles`} />
  return (
    <HomeShelf
      title={section.title}
      viewAllSlug={isCategoryUsable(tree, section.categoryId) ? section.categorySlug : null}
      viewAllName={section.categoryName}
      products={visible.map((product) => ({
        id: product.productId,
        name: product.name,
        price: product.price,
        discountPercent: product.discountPercent,
        finalPrice: product.finalPrice,
        catalogMainUrl: product.catalogMainUrl,
        catalogHoverUrl: null,
        inStock: product.inStock,
      }))}
    />
  )
}

interface HomeLivePreviewProps {
  sections: HomeSectionAdmin[]
  selectedId: number | undefined
  content: PreviewContent
  tree: AdminCategoryNode[]
  onSelect: (section: HomeSectionAdmin) => void
}

// Columna central: toda la página de inicio como la ve el cliente, incluso los bloques
// ocultos (atenuados). Un clic en un bloque lo selecciona para editarlo
function HomeLivePreview({ sections, selectedId, content, tree, onSelect }: HomeLivePreviewProps) {
  const selectedRef = useRef<HTMLDivElement>(null)

  // Con las tres columnas, la vista previa se desplaza hasta el bloque elegido
  useEffect(() => {
    if (!window.matchMedia('(min-width: 80rem)').matches) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    selectedRef.current?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [selectedId])

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <p className="mb-3 text-xs text-ink-muted">Vista previa en vivo · clic en un bloque para editarlo</p>

      <div className="overflow-hidden rounded-xl border border-admin-line bg-canvas font-sans text-ink">
        <div className="flex h-11 items-center justify-center border-b border-admin-line text-[13px] font-bold uppercase tracking-[0.2em]">
          {SITE_NAME}
        </div>

        <div className="flex flex-col gap-2 py-4">
          {sections.map((section, index) => {
            const isSelected = section.id === selectedId
            const name = sectionDisplayName(section)
            const count =
              section.type === 'Banner'
                ? (content.items.get(section.id)?.length ?? section.itemCount)
                : (content.products.get(section.id)?.filter((p) => p.isVisible !== false).length ?? section.productCount)
            const notShown = !section.isActive ? 'Oculto' : count === 0 ? 'No se muestra: vacío' : null

            return (
              // Solo con el mouse: con el teclado se elige desde la lista
              <div
                key={section.id}
                ref={isSelected ? selectedRef : undefined}
                onClick={() => onSelect(section)}
                className={`relative scroll-my-4 cursor-pointer py-4 outline-offset-[-2px] transition-[outline-color] ${
                  isSelected ? 'outline-2 outline-admin-accent' : 'outline-2 outline-transparent hover:outline-admin-accent/30'
                }`}
              >
                {isSelected && (
                  <span className="absolute left-2 top-2 z-10 rounded bg-admin-accent px-2 py-0.5 text-[11px] font-semibold text-white">
                    {index + 1} · {name}
                  </span>
                )}
                {notShown && (
                  <span className="absolute right-2 top-2 z-10 rounded border border-admin-line bg-white px-2 py-0.5 text-[11px] font-semibold text-ink">
                    {notShown}
                  </span>
                )}
                {/* inert: sin clics ni foco en los enlaces de la vista previa */}
                <div inert className={section.isActive ? '' : 'opacity-35'}>
                  <BlockContent section={section} content={content} tree={tree} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default HomeLivePreview
