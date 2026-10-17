import { useEffect, useRef } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { X } from 'lucide-react'

type ModalSize = 'default' | 'small' | 'fullscreen'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  ariaLabel: string
  size?: ModalSize
  showCloseButton?: boolean
  topBar?: ReactNode // Barra superior, solo en celular
  children: ReactNode
}

const dialogSizeClasses: Record<ModalSize, string> = {
  // Celular: pantalla completa · Computador: tarjeta grande centrada
  default: [
    'm-0 h-full max-h-none w-full max-w-none bg-surface max-md:bg-canvas',
    'md:m-auto md:h-fit md:min-h-[26rem] md:max-w-3xl md:border md:border-white/60',
    'md:supports-[backdrop-filter]:glass-light',
  ].join(' '),
  // Siempre una tarjeta pequeña centrada
  small: [
    'm-auto h-fit w-[calc(100%-2rem)] max-w-md border border-white/60 bg-surface',
    'supports-[backdrop-filter]:glass-light',
  ].join(' '),
  // Siempre pantalla completa
  fullscreen: 'm-0 h-full max-h-none w-full max-w-none bg-canvas',
}

// Estructura interna: barra fija arriba y contenido con scroll debajo
const layoutClasses: Record<ModalSize, string> = {
  default: 'flex h-full flex-col md:block md:h-auto',
  small: '',
  fullscreen: 'flex h-full flex-col',
}

const contentSizeClasses: Record<ModalSize, string> = {
  default: 'relative flex-1 overflow-y-auto px-6 pb-10 pt-3 md:px-10',
  small: 'relative px-6 pb-6 pt-3',
  fullscreen: 'relative flex-1 overflow-y-auto',
}

function Modal({
  isOpen,
  onClose,
  ariaLabel,
  size = 'default',
  showCloseButton = true,
  topBar,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    }
    if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target !== e.currentTarget) return

    const rect = e.currentTarget.getBoundingClientRect()
    const isInside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom

    if (!isInside) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleClick}
      aria-label={ariaLabel}
      className={[
        'p-0 text-ink',
        'backdrop:bg-surface/40 backdrop:backdrop-blur-md',
        dialogSizeClasses[size],
      ].join(' ')}
    >
      <div className={layoutClasses[size]}>
        {/* Barra superior: solo en celular, fija mientras el contenido se desplaza */}
        {isOpen && topBar && <div className="shrink-0 md:hidden">{topBar}</div>}

        <div className={contentSizeClasses[size]}>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              // Si hay barra superior, en celular la ✕ ya está en ella
              className={`absolute right-3 top-3 p-2 text-ink-muted hover:text-ink ${
                topBar ? 'hidden md:block' : ''
              }`}
            >
              <X size={22} strokeWidth={1.5} aria-hidden="true" />
            </button>
          )}

          {isOpen && children}
        </div>
      </div>
    </dialog>
  )
}

export default Modal