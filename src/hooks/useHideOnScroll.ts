import { useEffect, useState } from 'react'

// Atributo con el que una página marca el elemento de referencia
export const HIDE_HEADER_ANCHOR = 'data-hide-header-anchor'

const ANCHOR_FRACTION = 0.2  // Se esconde al pasar el 20% del elemento marcado
const FALLBACK_PX = 300      // Umbral si la página no marcó ningún elemento
const TOLERANCE_PX = 4       // Ignora movimientos mínimos (temblor del trackpad)

// Calcula a cuántos píxeles de scroll está el umbral
function getThreshold(): number {
  const anchor = document.querySelector<HTMLElement>(`[${HIDE_HEADER_ANCHOR}]`)
  if (!anchor) return FALLBACK_PX

  const rect = anchor.getBoundingClientRect()
  // Posición del elemento respecto al inicio del documento, más el 20% de su alto
  return rect.top + window.scrollY + rect.height * ANCHOR_FRACTION
}

// Retorna true cuando el header debe estar escondido
export function useHideOnScroll(enabled: boolean): boolean {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!enabled) return

    let lastY = window.scrollY
    let ticking = false

    const update = () => {
      ticking = false
      const y = window.scrollY
      const delta = y - lastY

      // Movimientos mínimos se acumulan hasta superar la tolerancia
      if (Math.abs(delta) < TOLERANCE_PX) return

      if (y < getThreshold()) setHidden(false) // Antes del umbral: siempre visible
      else setHidden(delta > 0)                // Después: baja = esconder, sube = mostrar

      lastY = y
    }

    // Procesa el scroll como máximo una vez por cuadro de pantalla
    const handleScroll = () => {
      if (!ticking) {
        ticking = true
        window.requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enabled])

  // En las páginas sin el efecto, nunca está escondido
  return enabled && hidden
}