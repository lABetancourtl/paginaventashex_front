import type { QueryClient } from '@tanstack/react-query'

// La animación de carga vive en index.html (sale antes que JavaScript); aquí solo se muestra u oculta

const MIN_VISIBLE_MS = 700 // Tiempo mínimo visible, para que no parpadee
const MAX_WAIT_MS = 8000 // Nunca tapa la página más de esto, aunque algo no termine de cargar

// performance.now() cuenta desde que se abrió la pestaña: la carga inicial ya "lleva" ese tiempo visible
let shownAt = 0
let hideTimer: ReturnType<typeof setTimeout> | undefined

const getLoader = () => document.getElementById('page-loader')

export function showPageLoader() {
  clearTimeout(hideTimer)
  shownAt = performance.now()
  getLoader()?.classList.remove('is-hidden')
}

export function hidePageLoader() {
  clearTimeout(hideTimer)
  const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - shownAt))
  hideTimer = setTimeout(() => getLoader()?.classList.add('is-hidden'), remaining)
}

// ─── ¿La página ya está lista para verse? ───────────────────

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

// Solo cuentan las consultas que aún no tienen ningún dato (las que pintan un esqueleto);
// una recarga en segundo plano de algo que ya se ve no hace esperar
function isLoadingData(queryClient: QueryClient) {
  return queryClient.isFetching({ predicate: (query) => query.state.status === 'pending' }) > 0
}

function waitForData(queryClient: QueryClient, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (!isLoadingData(queryClient)) return resolve()

    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      if (!isLoadingData(queryClient)) done()
    })
    const done = () => {
      unsubscribe()
      signal.removeEventListener('abort', done)
      resolve()
    }
    signal.addEventListener('abort', done)
  })
}

// Imágenes y videos que se ven en pantalla ahora mismo (no los de más abajo,
// ni los de un carrusel que están fuera de la vista hacia el lado)
function isInViewport(element: Element) {
  const rect = element.getBoundingClientRect()
  return (
    rect.width > 0 &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  )
}

function waitForVisibleMedia(signal: AbortSignal) {
  const pending = Array.from(document.querySelectorAll<HTMLImageElement | HTMLVideoElement>('img, video'))
    .filter(isInViewport)
    .filter((media) =>
      media instanceof HTMLImageElement ? !media.complete : media.readyState < HTMLMediaElement.HAVE_CURRENT_DATA,
    )

  return Promise.all(
    pending.map(
      (media) =>
        new Promise<void>((resolve) => {
          const done = () => resolve()
          // Si falla, también cuenta como terminada: no se espera algo que nunca llegará
          media.addEventListener(media instanceof HTMLImageElement ? 'load' : 'loadeddata', done, { once: true })
          media.addEventListener('error', done, { once: true })
          signal.addEventListener('abort', done, { once: true })
        }),
    ),
  )
}

async function waitUntilReady(queryClient: QueryClient, signal: AbortSignal) {
  // Deja que la página nueva se monte y pida sus datos
  await nextFrame()
  await nextFrame()

  // Una consulta puede llevar a otra (p. ej. el producto y luego sus relacionados): se repite unas veces
  for (let round = 0; round < 4 && !signal.aborted; round++) {
    await waitForData(queryClient, signal)
    await nextFrame() // React pinta lo que llegó
    await nextFrame()
    await waitForVisibleMedia(signal)
    if (!isLoadingData(queryClient)) break
  }

  await document.fonts?.ready
}

// Resuelve cuando la página está lista, o al cumplirse el tiempo máximo
export function waitForPageReady(queryClient: QueryClient, signal: AbortSignal) {
  return Promise.race([
    waitUntilReady(queryClient, signal),
    new Promise<void>((resolve) => setTimeout(resolve, MAX_WAIT_MS)),
  ])
}
