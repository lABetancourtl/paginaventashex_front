import { useEffect, useRef } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  ariaLabel: string
  children: ReactNode
}

function Modal({ isOpen, onClose, ariaLabel, children }: ModalProps) {
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
    if (e.target === e.currentTarget) {
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
        // Celular: pantalla completa
        'm-0 h-full max-h-none w-full max-w-none bg-surface p-0 text-ink',
        // Fondo claro y desenfocado detrás del modal
        'backdrop:bg-surface/10 backdrop:backdrop-blur-md',
        // Desde tablet: tarjeta centrada
        'md:m-auto md:h-fit md:min-h-[26rem] md:max-w-3xl',
        // Efecto vidrio: solo si el navegador soporta el desenfoque
        'md:supports-[backdrop-filter]:bg-surface/75',
      ].join(' ')}
    >
      <div className="relative h-full overflow-y-auto px-6 pb-10 pt-3 md:h-auto md:px-10">
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