import { useEffect, useState } from 'react'

// Recibe una fecha límite (en milisegundos) y retorna los segundos que faltan
export function useCountdown(targetTime: number | null): number {
  // Solo guardamos la hora actual; los segundos restantes se calculan
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (targetTime === null) return

    // Actualiza la hora actual cada segundo
    const intervalId = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    // Limpieza: detiene el intervalo si cambia la fecha o el componente desaparece
    return () => clearInterval(intervalId)
  }, [targetTime])

  if (targetTime === null) return 0

  // Estado derivado: se calcula en cada render
  return Math.max(0, Math.floor((targetTime - now) / 1000))
}