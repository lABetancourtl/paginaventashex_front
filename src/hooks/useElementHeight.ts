import { useEffect, useState } from 'react'

// Alto actual de un elemento en píxeles; se actualiza cuando cambia
// (por ejemplo, al abrir o cerrar un desplegable dentro de él)
export function useElementHeight<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  // ref de callback: sirve aunque el elemento aparezca después del primer render
  return [setNode, height] as const
}
