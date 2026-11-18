import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { hidePageLoader, showPageLoader, waitForPageReady } from './pageLoader'

// Al cambiar de página, la animación solo sale si tarda más que esto
// (con los datos ya en caché, la página aparece sin animación)
const SHOW_DELAY_MS = 200

// Controla la animación de carga de index.html: la oculta cuando la página
// tiene sus datos y las imágenes que se ven en pantalla
function PageLoader() {
  const { pathname } = useLocation()
  const queryClient = useQueryClient()
  const isFirstLoad = useRef(true)

  useEffect(() => {
    const controller = new AbortController()
    let showTimer: ReturnType<typeof setTimeout> | undefined

    // En la carga inicial ya está visible; al navegar, se muestra solo si demora
    if (!isFirstLoad.current) {
      showTimer = setTimeout(showPageLoader, SHOW_DELAY_MS)
    }

    waitForPageReady(queryClient, controller.signal).then(() => {
      if (controller.signal.aborted) return
      // Se marca aquí y no antes: en desarrollo (StrictMode) el efecto corre dos veces
      isFirstLoad.current = false
      clearTimeout(showTimer)
      hidePageLoader()
    })

    return () => {
      controller.abort()
      clearTimeout(showTimer)
    }
  }, [pathname, queryClient])

  return null
}

export default PageLoader
