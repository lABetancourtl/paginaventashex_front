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

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  const { catalogMainUrl: mainUrl, catalogHoverUrl: hoverUrl } = product

  return (
    <article className="group">
      <Link to={`/producto/${product.id}`} className="block">
        {/* Cuadrado, como las fotos: sin espacio sobrante arriba ni abajo */}
        <div className="relative aspect-square overflow-hidden">
          {mainUrl && hoverUrl ? (
            <div className="flex size-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:block md:overflow-hidden">
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
        </div>

        {/* Se ve la subcategoría en singular; el nombre completo queda para lectores de pantalla */}
        <h3 className="mt-3 px-1 text-xs font-bold uppercase tracking-wide">
          {toSingular(product.categoryName)}
          <span className="sr-only">: {product.name}</span>
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