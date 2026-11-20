import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

// Frases de la medusa: sale una al azar cada vez que aparece
const PHRASES = [
  'Llegaste al fondo del mar. Aquí ya no hay ropa, solo yo.',
  'Shhh… aquí abajo duermen los bebés (y las medusas).',
  'Tan abajo y sin flotador. ¿Volvemos a la orilla?',
  'Psst: la ropa linda está arriba. Yo solo cuido el fondo.',
  'Si bajas más, te sale una aleta.',
]

const CLOSE_MS = 1150 // Lo que dura el cierre tipo telón (ver .deep-sea.is-closing en index.css)
const REOPEN_PX = 60 // Al subir esta distancia desde el final, se prepara de nuevo
const BOTTOM_TOLERANCE_PX = 4 // Margen para "llegó al final" (el scroll a veces frena a 1-2 px)
const SCROLL_IDLE_MS = 120 // Sin eventos de scroll por este tiempo = el scroll se detuvo

// Partículas flotando: posiciones y ritmos fijos (pseudoaleatorios) para que no cambien
// en cada render. El retraso negativo las reparte por todo el fondo desde el inicio
const seeded = (i: number, n: number) => {
  const value = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453
  return value - Math.floor(value)
}
const PARTICLES = Array.from({ length: 22 }, (_, i) => {
  const duration = 10 + seeded(i, 3) * 10
  return {
    '--x': `${seeded(i, 1) * 100}%`,
    '--size': `${2 + seeded(i, 2) * 3}px`,
    '--duration': `${duration}s`,
    '--delay': `${-seeded(i, 4) * duration}s`,
    '--drift': `${(seeded(i, 5) - 0.5) * 40}px`,
    '--alpha': `${0.45 + seeded(i, 6) * 0.45}`,
  } as CSSProperties
})

const randomPhrase = (current?: string) => {
  const options = PHRASES.filter((phrase) => phrase !== current)
  return options[Math.floor(Math.random() * options.length)]
}

// Píxeles que faltan para llegar al final de la página
const distanceToBottom = () =>
  document.documentElement.scrollHeight - (window.innerHeight + window.scrollY)

// "Fondo del mar" debajo del footer: la medusa sube con un mensaje; al llegar al final
// del todo se recoge y queda solo el footer. Si se sube y se vuelve a bajar, sale otra vez
function FooterDeepSea() {
  const sectionRef = useRef<HTMLElement>(null)
  const [phrase, setPhrase] = useState(() => randomPhrase())

  // La animación de la medusa arranca cuando el fondo entra en pantalla
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) section.classList.add('is-seen')
      },
      { threshold: 0.3 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  // Al llegar al final se recoge; al subir un poco, se prepara de nuevo con otra frase
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let ticking = false
    let closing = false
    let closeTimer: ReturnType<typeof setTimeout> | undefined
    let idleTimer: ReturnType<typeof setTimeout> | undefined

    const close = () => {
      closing = true
      const height = section.offsetHeight
      section.style.height = `${height}px` // Fija la altura actual...
      section.style.setProperty('--deep-sea-h', `${height}px`) // Para que los rayos no se aplasten
      void section.offsetHeight // ...y la aplica antes de animar
      // El contenido no cambia de lugar al empezar: solo se desliza, con la misma curva y
      // duración que el telón. Avanza en proporción a lo que baja la altura, de modo que,
      // cuando lo visible mide lo mismo que el contenido, queda completo y centrado
      const inner = section.querySelector<HTMLElement>('.deep-sea-inner')
      const svg = inner?.querySelector('svg')
      const message = inner?.querySelector('.deep-sea-message')
      if (inner && svg && message) {
        const sectionTop = section.getBoundingClientRect().top
        const contentTop = svg.getBoundingClientRect().top - sectionTop
        const contentHeight = message.getBoundingClientRect().bottom - sectionTop - contentTop
        const free = height - contentHeight
        const ratio = free > 0 ? Math.min(Math.max(contentTop / free, 0), 1) : 0.5
        inner.style.transition = `transform ${CLOSE_MS - 50}ms cubic-bezier(.6, 0, .25, 1)`
        inner.style.transform = `translateY(${-ratio * height}px)`
      }
      section.classList.add('is-closing')
      section.style.height = '0px' // Se recoge: la página baja hasta dejar el footer al final

      closeTimer = setTimeout(() => {
        section.classList.add('is-gone')
        section.classList.remove('is-closing', 'is-seen')
        section.style.height = ''
        section.style.removeProperty('--deep-sea-h')
        if (inner) {
          inner.style.transition = ''
          inner.style.transform = ''
        }
        closing = false
      }, CLOSE_MS)
    }

    const update = () => {
      ticking = false
      if (closing) return
      const isGone = section.classList.contains('is-gone')

      if (!isGone && distanceToBottom() <= BOTTOM_TOLERANCE_PX) {
        close()
      } else if (isGone && distanceToBottom() > REOPEN_PX) {
        setPhrase((current) => randomPhrase(current))
        section.classList.remove('is-gone')
      }
    }

    const handleScroll = () => {
      // Revisión final cuando el scroll se detiene: con un scroll rápido, el último
      // evento puede llegar antes de tocar el final y no se esperaría a otro scroll
      clearTimeout(idleTimer)
      idleTimer = setTimeout(update, SCROLL_IDLE_MS)

      if (ticking || closing) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Donde existe, el navegador avisa justo cuando termina el scroll (también la inercia)
    window.addEventListener('scrollend', update)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scrollend', update)
      clearTimeout(closeTimer)
      clearTimeout(idleTimer)
    }
  }, [])

  return (
    <section ref={sectionRef} className="deep-sea" aria-label="Fin de la página">
      <div className="deep-sea-particles" aria-hidden="true">
        {PARTICLES.map((style, i) => (
          <span key={i} className="deep-sea-particle" style={style} />
        ))}
      </div>
      <div className="deep-sea-inner">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className="deep-sea-bubble deep-sea-dot" cx="92" cy="40" r="3" />
          <circle className="deep-sea-bubble deep-sea-dot" cx="28" cy="52" r="2.5" />
          <g className="deep-sea-jelly">
            <g className="deep-sea-float">
              <path
                className="deep-sea-bell"
                d="M32 62 C32 38 46 28 60 28 C74 28 88 38 88 62 Q81 68 74 62 Q67 68 60 62 Q53 68 46 62 Q39 68 32 62 Z"
              />
              <g className="deep-sea-tentacles">
                <path d="M46 70 C42 80 50 86 46 98" />
                <path d="M60 70 C56 82 64 88 60 102" />
                <path d="M74 70 C70 80 78 86 74 98" />
              </g>
              <g className="deep-sea-eyes">
                <circle className="deep-sea-dot" cx="52" cy="48" r="4" />
                <circle className="deep-sea-dot" cx="68" cy="48" r="4" />
              </g>
            </g>
          </g>
        </svg>
        <p className="deep-sea-message max-w-lg text-balance text-xl font-bold md:text-2xl">{phrase}</p>
      </div>
    </section>
  )
}

export default FooterDeepSea
