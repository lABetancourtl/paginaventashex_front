import { useEffect, useRef } from 'react'
import type { MouseEvent, ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  ariaLabel: string
  children: ReactNode
}

function Modal({ isOpen, onClose, ariaLabel, children }: ModalProps) {
  // Referencia al elemento <dialog> real del DOM
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Sincroniza el estado de React con el <dialog> del navegador
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

  // Cerrar al hacer clic en el fondo oscuro (fuera del contenido)
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
      style={{ padding: 0 }}
    >
      <div style={{ padding: '1.5rem' }}>
        <button type="button" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        {/* El contenido solo existe mientras el modal está abierto */}
        {isOpen && children}
      </div>
    </dialog>
  )
}

export default Modal