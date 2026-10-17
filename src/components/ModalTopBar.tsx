import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalTopBarProps {
  onClose: () => void
  closeLabel?: string
  children?: ReactNode // Lo que va en el centro (ej: el nombre de la tienda)
}

function ModalTopBar({ onClose, closeLabel = 'Cerrar', children }: ModalTopBarProps) {
  return (
    <div className="flex h-14 items-center border-b border-line px-2">
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-line/50"
      >
        <X size={22} strokeWidth={1.5} aria-hidden="true" />
      </button>

      {/* pr-10 compensa el ancho del botón, para centrar respecto a la pantalla */}
      <div className="flex-1 pr-10 text-center text-sm font-extrabold uppercase tracking-wider">
        {children}
      </div>
    </div>
  )
}

export default ModalTopBar