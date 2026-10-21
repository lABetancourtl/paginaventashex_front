import { Link } from 'react-router'
import { ImageOff } from 'lucide-react'
import { cloudinarySrcSet, cloudinaryUrl } from '../../../utils/cloudinary'
import { formatCOP } from '../../../utils/formatters'
import type { Product } from '../types'

// Anchos disponibles y cuánto ocupa la imagen en pantalla:
// 4 columnas desde 768px (25% del ancho), 2 columnas en celular (50%)
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

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  const { catalogMainUrl: mainUrl, catalogHoverUrl: hoverUrl } = product
  const hasDiscount = product.discountPercent !== null && product.discountPercent > 0

  return (
    <article className="group">
      <Link to={`/producto/${product.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden bg-surface">
          {mainUrl && hoverUrl ? (
            // Dos imágenes: carrusel en celular, cambio al pasar el mouse en computador
            <div className="flex size-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:block md:overflow-hidden">
              <div className="size-full shrink-0 snap-start md:absolute md:inset-0">
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

          {hasDiscount && (
            <span className="absolute left-2 top-2 bg-sale-ink px-2 py-0.5 text-xs font-bold text-white">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        <h3 className="mt-3 line-clamp-2 px-1 text-xs font-bold uppercase tracking-wide">
          {product.name}
        </h3>

        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 px-1 text-xs">
          <span className={hasDiscount ? 'font-bold text-sale-ink' : undefined}>
            {formatCOP(product.finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-ink-muted line-through">
              <span className="sr-only">Antes </span>
              {formatCOP(product.price)}
            </span>
          )}
        </p>
      </Link>
    </article>
  )
}

export default ProductCard