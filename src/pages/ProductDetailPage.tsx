import { Link, useParams } from 'react-router'
import { ApiRequestError } from '../api/client'
import { primaryButtonClass } from '../components/formStyles'
import { SITE_NAME } from '../config/site'
import ProductGallery from '../features/catalog/components/ProductGallery'
import ProductPrice from '../features/catalog/components/ProductPrice'
import { useCategoryTree } from '../features/catalog/hooks/useCategoryTree'
import { useProduct } from '../features/catalog/hooks/useProduct'
import { findCategoryContextById } from '../features/catalog/categoryTree'
import { categoryPath } from '../features/catalog/catalogNav'
import type { Product } from '../features/catalog/types'
import ProductBenefits from '../features/catalog/components/ProductBenefits'
import ProductInfoSections from '../features/catalog/components/ProductInfoSections'

// Mostramos la disponibilidad, no la cantidad exacta
function getStockLabel(stock: number): { text: string; className: string } {
  if (stock <= 0) return { text: 'Agotado', className: 'text-danger' }
  if (stock <= 5) return { text: `¡Últimas ${stock} unidades!`, className: 'text-sale-ink' }
  return { text: 'Disponible', className: 'text-ink-muted' }
}

// La galería: las imágenes de media ordenadas, o las del catálogo si no hay
function getGalleryImages(product: Product): string[] {
  const fromMedia = [...product.media]
    .filter((item) => item.mediaType === 'Image')
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((item) => item.url)

  if (fromMedia.length > 0) return fromMedia

  return [product.catalogMainUrl, product.catalogHoverUrl].filter(
    (url): url is string => url !== null,
  )
}

function ProductDetailPage() {
  const { id } = useParams()
  const productId = Number(id)
  const isValidId = Number.isInteger(productId) && productId > 0

  const product = useProduct(productId, isValidId)
  const tree = useCategoryTree()

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
  const stock = getStockLabel(item.stock)
  const isSoldOut = item.stock <= 0
  const context = tree.data ? findCategoryContextById(tree.data, item.categoryId) : null

  // Espacio interior de cada bloque de la columna de información
  const blockClass = 'px-5 py-6 md:px-8 lg:px-10'

  return (
    <article className="border-b border-line px-1 md:grid md:grid-cols-[minmax(0,1fr)_24rem] md:px-2 lg:grid-cols-[minmax(0,1.7fr)_minmax(26rem,1fr)]">
      <title>{`${item.name} | ${SITE_NAME}`}</title>

      <ProductGallery images={images} productName={item.name} />

      {/* Columna de información: fija al recorrer las imágenes en computador */}
      <div className="md:sticky md:top-18 md:max-h-[calc(100vh-4.5rem)] md:self-start md:overflow-y-auto">
        {/* Bloque 1: ruta, nombre y precio */}
        <div className={`${blockClass} border-b border-line`}>
          {context && (
            <nav aria-label="Ruta de navegación" className="mb-3">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-wide text-ink-muted">
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

          <h1 className="text-base font-extrabold uppercase tracking-wide md:text-lg">{item.name}</h1>

          <div className="mt-2">
            <ProductPrice
              price={item.price}
              finalPrice={item.finalPrice}
              discountPercent={item.discountPercent}
              size="lg"
            />
          </div>
        </div>

        {/* Bloque 2: disponibilidad, compra y beneficios */}
        <div className={`${blockClass} border-b border-line`}>
          <p className={`text-sm font-medium ${stock.className}`}>{stock.text}</p>

          {/* Aquí irá el selector de talla, cuando el backend tenga variantes */}

          {/* PROVISIONAL: se activa cuando construyamos el carrito */}
          <button type="button" disabled className={`${primaryButtonClass} mt-5`}>
            {isSoldOut ? 'Agotado' : 'Agregar a la bolsa'}
          </button>

          <div className="mt-7">
            <ProductBenefits />
          </div>
        </div>

        {/* Bloque 3: secciones desplegables */}
        <div className={blockClass}>
          <ProductInfoSections description={item.description} sku={item.sku} />
        </div>
      </div>
    </article>
  )
}

export default ProductDetailPage