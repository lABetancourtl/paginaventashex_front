import { useEffect } from 'react'
import type { RefObject } from 'react'

// Llama a onDismiss cuando se hace clic fuera del elemento o se presiona Esc
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onDismiss: () => void,
) {
  useEffect(() => {
    // Solo escuchamos mientras está abierto
    if (!isOpen) return

    const handlePointerDown = (e: PointerEvent) => {
      // ¿El clic fue fuera del elemento?
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onDismiss()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    // Limpieza: dejamos de escuchar al cerrar o al desmontar
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [ref, isOpen, onDismiss])
}