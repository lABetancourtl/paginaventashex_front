import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface DevicePreviewFrameProps {
  width: number // Ancho de la pantalla simulada, en píxeles (ej: 390 para un celular)
  title: string
  children: ReactNode
}

// Muestra su contenido dentro de un iframe del ancho indicado. Los componentes de la tienda
// deciden su diseño con media queries, que miran el ancho de la ventana: dentro del iframe
// miran el ancho del iframe, así que se ven exactamente como en un celular.
// El contenido se pinta con un portal: sigue siendo el mismo árbol de React (mismos datos,
// mismos clics), solo que dibujado en el documento del iframe
function DevicePreviewFrame({ width, title, children }: DevicePreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null)
  const [height, setHeight] = useState(640)

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return

    // Documento vacío propio (about:blank está listo de inmediato)
    doc.open()
    doc.write(
      '<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0"></body></html>',
    )
    doc.close()

    // Copia los estilos de la app (Tailwind, fuentes). En desarrollo Vite los cambia al editar:
    // se vuelven a copiar cada vez que cambia el <head>
    const copyStyles = () => {
      doc.head.querySelectorAll('[data-preview-style]').forEach((node) => node.remove())
      document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
        const copy = node.cloneNode(true) as HTMLElement
        copy.setAttribute('data-preview-style', '')
        doc.head.appendChild(copy)
      })
    }
    copyStyles()
    // Solo si cambió un estilo (no, por ejemplo, el <title> de la pestaña)
    const isStyleNode = (node: Node) =>
      node instanceof HTMLStyleElement || (node instanceof HTMLLinkElement && node.rel === 'stylesheet')
    const headObserver = new MutationObserver((mutations) => {
      const touchesStyles = mutations.some((mutation) => {
        const target = mutation.target instanceof Text ? mutation.target.parentNode : mutation.target
        return (
          (target !== null && isStyleNode(target)) ||
          [...mutation.addedNodes, ...mutation.removedNodes].some(isStyleNode)
        )
      })
      if (touchesStyles) copyStyles()
    })
    headObserver.observe(document.head, { childList: true, subtree: true, characterData: true })

    const root = doc.createElement('div')
    doc.body.appendChild(root)
    setMountNode(root)

    // El iframe crece con su contenido: sin scroll propio, se desplaza con la página
    const sizeObserver = new ResizeObserver(() => setHeight(Math.ceil(root.getBoundingClientRect().height)))
    sizeObserver.observe(root)

    return () => {
      headObserver.disconnect()
      sizeObserver.disconnect()
      root.remove()
    }
  }, [])

  return (
    <>
      <iframe
        ref={iframeRef}
        title={title}
        style={{ width, height }}
        className="block max-w-full rounded-[16px] border-0 bg-canvas"
      />
      {mountNode && createPortal(children, mountNode)}
    </>
  )
}

export default DevicePreviewFrame
