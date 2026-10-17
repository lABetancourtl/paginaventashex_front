import { useEffect, useRef } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { X } from 'lucide-react'

type ModalSize = 'default' | 'small'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  ariaLabel: string
  size?: ModalSize
  children: ReactNode
}

// Clases del <dialog> según el tamaño
const dialogSizeClasses: Record<ModalSize, string> = {
  // Celular: pantalla completa · Computador: tarjeta grande centrada
  default: [
    'm-0 h-full max-h-none w-full max-w-none',
    'md:m-auto md:h-fit md:min-h-[26rem] md:max-w-3xl md:border md:border-white/60',
    'md:supports-[backdrop-filter]:glass-light',
  ].join(' '),
  // Siempre una tarjeta pequeña centrada
  small: [
    'm-auto h-fit w-[calc(100%-2rem)] max-w-md border border-white/60',
    'supports-[backdrop-filter]:glass-light',
  ].join(' '),
}

const contentSizeClasses: Record<ModalSize, string> = {
  default: 'h-full overflow-y-auto px-6 pb-10 pt-3 md:h-auto md:px-10',
  small: 'px-6 pb-6 pt-3',
}

function Modal({ isOpen, onClose, ariaLabel, size = 'default', children }: ModalProps) {
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
        'bg-surface p-0 text-ink',
        'backdrop:bg-surface/40 backdrop:backdrop-blur-md',
        dialogSizeClasses[size],
      ].join(' ')}
    >
      <div className={`relative ${contentSizeClasses[size]}`}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 p-2 text-ink-muted hover:text-ink"
        >
          <X size={22} strokeWidth={1.5} aria-hidden="true" />
        </button>

        {isOpen && children}
      </div>
    </dialog>
  )
}

export default Modal