import { useEffect, useState } from 'react'

// Retorna true cuando la página bajó más de `threshold` píxeles
export function useScrolledPast(threshold: number): boolean {
  const [past, setPast] = useState(() => window.scrollY > threshold)

  useEffect(() => {
    let ticking = false

    const update = () => {
      ticking = false
      setPast(window.scrollY > threshold)
    }

    // Procesa el scroll como máximo una vez por cuadro de pantalla
    const handleScroll = () => {
      if (!ticking) {
        ticking = true
        window.requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return past
}
