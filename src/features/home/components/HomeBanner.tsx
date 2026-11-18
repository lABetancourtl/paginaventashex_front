import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { cloudinarySrcSet, cloudinaryUrl } from '../../../utils/cloudinary'
import { categoryPath } from '../../catalog/catalogNav'
import type { HomeItemPublic } from '../types'

// Con varios medios: en el celular es un carrusel (uno por vez, se desliza con el dedo);
// desde el punto de corte pasan a ir uno al lado del otro
const layoutClasses: Record<number, string> = {
  1: 'grid grid-cols-1',
  2: 'flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible',
  3: 'flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:overflow-visible',
  4: 'flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:overflow-visible',
}

// Cada medio ocupa todo el ancho mientras es carrusel
const slideClasses: Record<number, string> = {
  1: '',
  2: 'w-full shrink-0 snap-start sm:w-auto',
  3: 'w-full shrink-0 snap-start sm:w-auto',
  4: 'w-full shrink-0 snap-start md:w-auto',
}

// Los puntos solo se ven mientras es carrusel
const dotsVisibility: Record<number, string> = {
  2: 'sm:hidden',
  3: 'sm:hidden',
  4: 'md:hidden',
}

// Varios medios juntos se recortan a la misma proporción para que queden alineados;
// uno solo se muestra completo, porque la imagen puede llevar texto
const tileAspect: Record<number, string> = {
  1: '',
  2: 'aspect-[4/5]',
  3: 'aspect-[3/4]',
  4: 'aspect-[3/4]',
}

const imageWidths: Record<number, number[]> = {
  1: [800, 1200, 1600, 2000, 2400],
  2: [600, 900, 1200, 1600],
  3: [500, 800, 1100],
  4: [400, 600, 900, 1200],
}

const imageSizes: Record<number, string> = {
  1: '100vw',
  2: '(min-width: 640px) 50vw, 100vw',
  3: '(min-width: 640px) 33vw, 100vw',
  4: '(min-width: 768px) 25vw, 100vw',
}

interface BannerMediaProps {
  item: HomeItemPublic
  count: number
  eager: boolean
}

function BannerMedia({ item, count, eager }: BannerMediaProps) {
  const fit = count === 1 ? 'block h-auto w-full' : 'size-full object-cover'

  if (item.mediaType === 'Video') {
    // Sin muted y playsInline, el navegador no lo reproduce solo
    return (
      <video
        src={item.url}
        autoPlay
        muted
        loop
        playsInline
        preload={eager ? 'auto' : 'metadata'}
        aria-label={item.categoryName ?? undefined}
        className={fit}
      />
    )
  }

  const widths = imageWidths[count] ?? imageWidths[1]
  return (
    <img
      src={cloudinaryUrl(item.url, widths[Math.floor(widths.length / 2)])}
      srcSet={cloudinarySrcSet(item.url, widths)}
      sizes={imageSizes[count] ?? '100vw'}
      // No hay texto alternativo por imagen: se usa el nombre de la categoría
      alt={item.categoryName ?? ''}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      className={fit}
    />
  )
}

interface HomeBannerProps {
  items: HomeItemPublic[]
  isFirst?: boolean // El primer bloque de la página carga sin esperar
}

function HomeBanner({ items, isFirst = false }: HomeBannerProps) {
  const count = Math.min(Math.max(items.length, 1), 4)
  const isCarousel = count > 1
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // El punto activo sigue al medio que se ve al deslizar
  const handleScroll = () => {
    const track = trackRef.current
    if (!track || track.clientWidth === 0) return
    setActiveIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  const goTo = (index: number) => {
    const track = trackRef.current
    track?.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' })
  }

  return (
    // Ya no va de borde a borde: márgenes laterales como los estantes
    <section aria-roledescription={isCarousel ? 'carrusel' : undefined} className="px-4 md:px-10">
      <div
        ref={trackRef}
        onScroll={isCarousel ? handleScroll : undefined}
        className={`gap-3 md:gap-4 ${layoutClasses[count]}`}
      >
        {items.map((item, index) => {
          const media = <BannerMedia item={item} count={count} eager={isFirst && index === 0} />
          const tileClass = `relative block overflow-hidden rounded-2xl bg-ink/5 ${tileAspect[count]} ${slideClasses[count]}`

          return item.categorySlug ? (
            <Link
              key={item.id}
              to={categoryPath(item.categorySlug)}
              aria-label={item.categoryName ? `Ver ${item.categoryName}` : undefined}
              className={`${tileClass} group`}
            >
              <div className="size-full transition-transform duration-700 motion-safe:group-hover:scale-[1.02]">
                {media}
              </div>
            </Link>
          ) : (
            <div key={item.id} className={tileClass}>
              {media}
            </div>
          )
        })}
      </div>

      {isCarousel && (
        <div className={`mt-3 flex justify-center gap-2 ${dotsVisibility[count]}`}>
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ver imagen ${index + 1} de ${items.length}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              // Área táctil más grande que el punto que se ve
              className="flex size-6 items-center justify-center"
            >
              <span
                className={`block size-2 rounded-full transition-colors ${
                  index === activeIndex ? 'bg-ink' : 'bg-ink/25'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export default HomeBanner
