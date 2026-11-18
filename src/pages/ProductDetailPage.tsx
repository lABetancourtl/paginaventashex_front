import { Link, useParams } from 'react-router'
import type { CSSProperties } from 'react'
import { ApiRequestError } from '../api/client'
import { SITE_NAME } from '../config/site'
import ProductGallery from '../features/catalog/components/ProductGallery'
import ProductPrice from '../features/catalog/components/ProductPrice'
import { useCategoryTree } from '../features/catalog/hooks/useCategoryTree'
import { useProduct } from '../features/catalog/hooks/useProduct'
import { findCategoryContextById } from '../features/catalog/categoryTree'
import { categoryPath } from '../features/catalog/catalogNav'
import type { ProductDetail } from '../features/catalog/types'
import ProductInfoTabs from '../features/catalog/components/ProductInfoTabs'
import RelatedProducts from '../features/catalog/components/RelatedProducts'
import ProductPurchasePanel from '../features/catalog/components/ProductPurchasePanel'
import { useElementHeight } from '../hooks/useElementHeight'

// La galería: las imágenes de media ordenadas, o las del catálogo si no hay
function getGalleryImages(product: ProductDetail): string[] {
  const fromMedia = [...product.media]
    .filter((item) => item.mediaType === 'Image')
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((item) => item.url)

  if (fromMedia.length > 0) return fromMedia

  return [product.catalogMainUrl, product.catalogHoverUrl].filter((url): url is string => url !== null)
}

function ProductDetailPage() {
  const { id } = useParams()
  const productId = Number(id)
  const isValidId = Number.isInteger(productId) && productId > 0

  const product = useProduct(productId, isValidId)
  const tree = useCategoryTree()
  // Alto de la columna de información, para fijarla sin cortar su contenido
  const [infoRef, infoHeight] = useElementHeight<HTMLDivElement>()

  const notFound = (
    <section className="px-4 py-16 text-center">
      <title>{`Producto no encontrado | ${SITE_NAME}`}</title>
      <h1 className="text-lg font-extrabold uppercase tracking-wide">Producto no encontrado</h1>
      <p className="mt-2 text-ink-muted">Es posible que ya no esté disponible.</p>
      <Link to="/" className="mt-4 inline-block text-sm underline underline-offset-4">
        Volver al inicio
      </Link>
    </section>
  )

  if (!isValidId) return notFound

  if (product.isPending) {
    return <p className="px-4 text-ink-muted">Cargando producto...</p>
  }

  if (product.error) {
    if (product.error instanceof ApiRequestError && product.error.status === 404) {
      return notFound
    }
    return <p className="px-4 text-danger">{product.error.message}</p>
  }

  const item = product.data
  const images = getGalleryImages(item)
  const context = tree.data ? findCategoryContextById(tree.data, item.categoryId) : null

  return (
    <>
      <article className="px-4 pt-4 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(20rem,1fr)] md:gap-8 md:px-10 md:pt-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-10">
        <title>{`${item.name} | ${SITE_NAME}`}</title>

        <ProductGallery images={images} productName={item.name} />

        {/* Computador: las fotos marcan el alto de la sección. contain:size hace que esta
          celda no cuente para el alto de la fila, así la página termina con la última foto
          aunque la información sea larga (por ejemplo, con una pestaña de texto extenso) */}
        <div className="md:[contain:size]">
          {/* Columna de información (computador), sin scroll propio:
            - si cabe en la pantalla, queda fija arriba bajo el header
            - si es más alta, baja con la página hasta mostrar su final y ahí queda fija
            Por eso el "top" es el menor entre el espacio del header y (alto de pantalla - alto de la columna) */}
          <div
            ref={infoRef}
            style={{ '--info-h': `${infoHeight}px` } as CSSProperties}
            className={[
              'md:sticky md:top-[min(4.5rem,calc(100vh-var(--info-h)-1rem))]',
              'md:transition-[top] md:duration-500 md:ease-header-show motion-reduce:transition-none',
              // Con el header escondido, la columna sube y aprovecha la pantalla
              '[[data-header-hidden]_&]:md:top-[min(1rem,calc(100vh-var(--info-h)-1rem))]',
            ].join(' ')}
          >
            <div className="flex flex-col gap-6 pb-2 pt-6 md:pt-2">
              {/* Bloque 1: ruta, nombre y precio */}
              <div className="space-y-2.5 border-b border-line-soft pb-6">
                {context && (
                  <nav aria-label="Ruta de navegación">
                    <ol className="flex flex-wrap items-center gap-1.5 text-[0.625rem] font-medium uppercase tracking-wider text-ink-muted">
                      <li>
                        <Link to="/" className="hover:text-ink">
                          Inicio
                        </Link>
                      </li>
                      <li aria-hidden="true">›</li>
                      <li>
                        <Link to={categoryPath(context.root.slug)} className="hover:text-ink">
                          {context.root.name}
                        </Link>
                      </li>
                      {context.current.id !== context.root.id && (
                        <>
                          <li aria-hidden="true">›</li>
                          <li>
                            <Link to={categoryPath(context.current.slug)} className="hover:text-ink">
                              {context.current.name}
                            </Link>
                          </li>
                        </>
                      )}
                    </ol>
                  </nav>
                )}

                <h1 className="text-lg font-bold uppercase tracking-wide md:text-xl">{item.name}</h1>

                <div>
                  <ProductPrice
                    price={item.price}
                    finalPrice={item.finalPrice}
                    discountPercent={item.discountPercent}
                    size="lg"
                  />
                </div>
              </div>

              {/* Bloque 2: color, talla, disponibilidad y compra */}
              <ProductPurchasePanel key={item.id} product={item} />

              {/* Bloque 3: información del producto, envíos y devoluciones (caja crema) */}
              <div className="rounded-xl bg-surface-soft px-5 py-4.5">
                <ProductInfoTabs description={item.description} />
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Al final: más productos de la misma subcategoría (y, si faltan, de la principal) */}
      {context && (
        <RelatedProducts subcategorySlug={context.current.slug} categorySlug={context.root.slug} excludeId={item.id} />
      )}
    </>
  )
}

export default ProductDetailPage
