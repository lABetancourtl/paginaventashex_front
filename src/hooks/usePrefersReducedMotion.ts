import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

// Avisa a React cuando cambia la preferencia del sistema
function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

// Lee el valor actual
function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

// true si el usuario pidió reducir las animaciones en su sistema
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot)
}