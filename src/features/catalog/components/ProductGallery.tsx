import { useRef, useState } from 'react'
import type { UIEvent } from 'react'
import { cloudinarySrcSet, cloudinaryUrl } from '../../../utils/cloudinary'

// Celular: la imagen ocupa todo el ancho · Computador: media columna de la galería
const IMAGE_WIDTHS = [400, 600, 800, 1000, 1200, 1600]
const IMAGE_SIZES = '(min-width: 768px) 35vw, 100vw'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

function ProductGallery({ images, productName }: ProductGalleryProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Celular: qué imagen está visible según el desplazamiento horizontal
  const handleScroll = (e: UIEvent<HTMLUListElement>) => {
    const list = e.currentTarget
    setActiveIndex(Math.round(list.scrollLeft / list.clientWidth))
  }

  // Desplaza el carrusel hasta una imagen
  const goTo = (index: number) => {
    const list = listRef.current
    if (!list) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    list.scrollTo({
      left: index * list.clientWidth,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center bg-surface text-sm text-ink-muted">
        Este producto aún no tiene imágenes.
      </div>
    )
  }

  return (
    <div aria-roledescription="carrusel" aria-label={`Imágenes de ${productName}`}>
      <ul
        ref={listRef}
        onScroll={handleScroll}
        className={[
          // Celular: carrusel horizontal que se acomoda en cada imagen
          'flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          // Computador: grilla de dos columnas
          'md:grid md:grid-cols-2 md:gap-1.5 md:overflow-visible',
        ].join(' ')}
      >
        {images.map((url, index) => (
          <li
            key={url}
            aria-roledescription="imagen"
            aria-label={`${index + 1} de ${images.length}`}
            className="aspect-[3/4] w-full shrink-0 snap-start bg-surface md:w-auto"
          >
            <img
              src={cloudinaryUrl(url, 1000)}
              srcSet={cloudinarySrcSet(url, IMAGE_WIDTHS)}
              sizes={IMAGE_SIZES}
              alt={index === 0 ? productName : `${productName}, vista ${index + 1}`}
              // La primera imagen es lo más importante: se pide de inmediato
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              decoding="async"
              className="size-full object-contain"
            />
          </li>
        ))}
      </ul>

      {/* Indicadores: solo en celular y si hay más de una imagen */}
      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-2 md:hidden">
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ver imagen ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              className="h-1 w-6 bg-line transition-colors aria-[current=true]:bg-ink"
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGallery