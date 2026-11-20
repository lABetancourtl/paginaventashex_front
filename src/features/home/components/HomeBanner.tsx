import { useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  cloudinaryCropSrcSet,
  cloudinaryResizeAfter,
  cloudinaryResizeAfterSrcSet,
  cloudinarySrcSet,
  cloudinaryUrl,
} from '../../../utils/cloudinary'
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
// Uno solo: en celular se recorta a 4:5 (vertical, más grande); en computador se ve completo
const tileAspect: Record<number, string> = {
  1: 'aspect-[4/5] md:aspect-auto',
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

const MOBILE_CROP_WIDTHS = [400, 600, 800, 1000, 1200]

interface BannerMediaProps {
  item: HomeItemPublic
  count: number
  eager: boolean
}

// Versión para celular de un banner de un solo medio: la que subió el admin (ya en 4:5)
// o, si no hay, la foto principal recortada a 4:5 por Cloudinary
function mobileSrcSet(item: HomeItemPublic): string | null {
  if (item.mobileUrl) return cloudinaryResizeAfterSrcSet(item.mobileUrl, MOBILE_CROP_WIDTHS)
  if (item.mediaType === 'Image') return cloudinaryCropSrcSet(item.url, MOBILE_CROP_WIDTHS, '4:5')
  return null
}

function BannerMedia({ item, count, eager }: BannerMediaProps) {
  // Uno solo: llena el recuadro 4:5 en celular y conserva su alto natural en computador
  const fit = count === 1 ? 'block size-full object-cover md:h-auto md:w-full' : 'size-full object-cover'
  const alt = item.categoryName ?? '' // No hay texto alternativo por medio: se usa la categoría

  if (item.mediaType === 'Video') {
    // Sin muted y playsInline, el navegador no lo reproduce solo
    const video = (
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
    // Video de un solo medio con versión para celular: en celular la imagen, en computador el video
    if (count !== 1 || !item.mobileUrl) return video
    return (
      <>
        <img
          src={cloudinaryResizeAfter(item.mobileUrl, 800)}
          srcSet={cloudinaryResizeAfterSrcSet(item.mobileUrl, MOBILE_CROP_WIDTHS)}
          sizes="100vw"
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="block size-full object-cover md:hidden"
        />
        <div className="hidden md:block">{video}</div>
      </>
    )
  }

  const widths = imageWidths[count] ?? imageWidths[1]
  const img = (
    <img
      src={cloudinaryUrl(item.url, widths[Math.floor(widths.length / 2)])}
      srcSet={cloudinarySrcSet(item.url, widths)}
      sizes={imageSizes[count] ?? '100vw'}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      className={fit}
    />
  )

  const mobile = count === 1 ? mobileSrcSet(item) : null
  if (!mobile) return img

  // Celular: la versión vertical 4:5 (el recuadro ya reserva ese espacio, así la página no salta)
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobile} sizes="100vw" />
      {img}
    </picture>
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
    <section
      aria-roledescription={isCarousel ? 'carrusel' : undefined}
      // Uno solo va de borde a borde en celular. Si además es el primer bloque, sube hasta
      // pegarse al header: se mete 0.75rem (el radio de sus esquinas) por debajo, para que en
      // las esquinas redondeadas se vea la imagen y no un hueco; 0.5rem es el margen de la página
      className={
        count === 1 ? `md:px-10 ${isFirst ? '-mt-[calc(0.5rem+0.75rem)] md:mt-0' : ''}` : 'px-4 md:px-10'
      }
    >
      <div
        ref={trackRef}
        onScroll={isCarousel ? handleScroll : undefined}
        className={`gap-3 md:gap-4 ${layoutClasses[count]}`}
      >
        {items.map((item, index) => {
          const media = <BannerMedia item={item} count={count} eager={isFirst && index === 0} />
          const corners = count === 1 ? 'rounded-none md:rounded-2xl' : 'rounded-2xl'
          const tileClass = `relative block overflow-hidden bg-ink/5 ${corners} ${tileAspect[count]} ${slideClasses[count]}`

          return item.categorySlug ? (
            <Link
              key={item.id}
              to={categoryPath(item.categorySlug)}
              aria-label={item.categoryName ? `Ver ${item.categoryName}` : undefined}
              // Sin efecto al pasar el mouse. Solo con el teclado (Tab) se marca el borde, para saber dónde está el foco;
              // va en una capa encima, por dentro, para que el overflow-hidden no lo recorte
              className={`${tileClass} after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-inset focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ink/60`}
            >
              {media}
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
