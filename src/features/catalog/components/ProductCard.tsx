import { useRef } from 'react'
import type { UIEvent } from 'react'
import { Link } from 'react-router'
import { ImageOff } from 'lucide-react'
import { cloudinarySrcSet, cloudinaryUrl } from '../../../utils/cloudinary'
import { toSingular } from '../../../utils/text'
import ProductPrice from './ProductPrice'
import type { Product } from '../types'

const IMAGE_WIDTHS = [300, 450, 600, 900, 1200]
const IMAGE_SIZES = '(min-width: 768px) 25vw, 50vw'

interface ProductImageProps {
  url: string
  alt: string
}

function ProductImage({ url, alt }: ProductImageProps) {
  return (
    <img
      src={cloudinaryUrl(url, 600)}
      srcSet={cloudinarySrcSet(url, IMAGE_WIDTHS)}
      sizes={IMAGE_SIZES}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="size-full object-contain"
    />
  )
}

// Lo mínimo para pintar la tarjeta: sirve para el catálogo y para los estantes del inicio
export type ProductCardData = Pick<
  Product,
  'id' | 'name' | 'price' | 'finalPrice' | 'discountPercent' | 'catalogMainUrl' | 'catalogHoverUrl' | 'inStock'
> & { categoryName?: string }

interface ProductCardProps {
  product: ProductCardData
}

function ProductCard({ product }: ProductCardProps) {
  const { catalogMainUrl: mainUrl, catalogHoverUrl: hoverUrl } = product
  const hasTwoPhotos = Boolean(mainUrl && hoverUrl)
  const thumbRef = useRef<HTMLSpanElement>(null)

  // Celular: la barra sigue al deslizar entre las dos fotos (sin re-render, directo al estilo)
  const handlePhotosScroll = (e: UIEvent<HTMLDivElement>) => {
    const track = e.currentTarget
    const max = track.scrollWidth - track.clientWidth
    const progress = max > 0 ? track.scrollLeft / max : 0
    if (thumbRef.current) thumbRef.current.style.transform = `translateX(${progress * 100}%)`
  }

  return (
    <article className="group">
      <Link to={`/producto/${product.id}`} className="block">
        {/* Cuadrado, como las fotos: sin espacio sobrante arriba ni abajo */}
        <div className="relative aspect-square overflow-hidden rounded-xl">
          {mainUrl && hoverUrl ? (
            <div
              onScroll={handlePhotosScroll}
              className="flex size-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:block md:overflow-hidden"
            >
              <div className="size-full shrink-0 snap-start md:absolute md:inset-0 md:transition-opacity md:duration-300 md:group-hover:opacity-0">
                <ProductImage url={mainUrl} alt={product.name} />
              </div>
              <div className="size-full shrink-0 snap-start md:absolute md:inset-0 md:opacity-0 md:transition-opacity md:duration-300 md:group-hover:opacity-100">
                <ProductImage url={hoverUrl} alt="" />
              </div>
            </div>
          ) : mainUrl ? (
            <ProductImage url={mainUrl} alt={product.name} />
          ) : (
            <div className="flex size-full items-center justify-center text-ink-muted/50">
              <ImageOff size={32} strokeWidth={1.25} aria-hidden="true" />
              <span className="sr-only">Producto sin imagen</span>
            </div>
          )}

          
          {product.inStock === false && (
            <span className="absolute left-2 top-2 bg-ink/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Agotado
            </span>
          )}
        </div>

        {/* Celular: barra que avisa que hay otra foto al deslizar (la parte oscura es la foto que se ve).
            Con una sola foto no se ve, pero guarda su espacio para que los nombres queden alineados */}
        <div
          aria-hidden="true"
          className={`mt-2 h-[3px] overflow-hidden rounded-full bg-ink/10 md:hidden ${hasTwoPhotos ? '' : 'invisible'}`}
        >
          {hasTwoPhotos && (
            <span ref={thumbRef} className="block h-full w-1/2 rounded-full bg-ink/35 will-change-transform" />
          )}
        </div>

        {/* Se ve la subcategoría en singular; el nombre completo queda para lectores de pantalla.
            Sin subcategoría (estantes del inicio), se muestra el nombre */}
        <h3 className="mt-3 px-1 text-xs font-bold uppercase tracking-wide">
          {product.categoryName ? (
            <>
              {toSingular(product.categoryName)}
              <span className="sr-only">: {product.name}</span>
            </>
          ) : (
            product.name
          )}
        </h3>

        <div className="mt-1 px-1">
          <ProductPrice
            price={product.price}
            finalPrice={product.finalPrice}
            discountPercent={product.discountPercent}
          />
        </div>
      </Link>
    </article>
  )
}

export default ProductCard