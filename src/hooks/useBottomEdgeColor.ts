import { useEffect } from 'react'

// Atributo en <html> cuando el footer ocupa el borde inferior de la pantalla
const ATTRIBUTE = 'data-footer-at-bottom'

// En el celular, lo que asoma más allá de la página (el rebote del scroll o la barra del
// navegador al aparecer/esconderse) toma el fondo de <html>. Este hook marca <html> cuando
// lo que está en el borde inferior es el footer, para que ese fondo sea su verde;
// el resto del tiempo queda el crema de la página (ver index.css)
export function useBottomEdgeColor() {
  useEffect(() => {
    // Solo táctil: en computador no hay barra que aparezca ni rebote
    if (!window.matchMedia('(pointer: coarse)').matches) return

    const root = document.documentElement
    let ticking = false

    const update = () => {
      ticking = false
      const element = document.elementFromPoint(window.innerWidth / 2, window.innerHeight - 1)
      root.toggleAttribute(ATTRIBUTE, element?.closest('footer') != null)
    }

    const schedule = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('scrollend', schedule)
    window.addEventListener('resize', schedule) // La barra del navegador cambia el alto de la pantalla

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('scrollend', schedule)
      window.removeEventListener('resize', schedule)
      root.removeAttribute(ATTRIBUTE)
    }
  }, [])
}
