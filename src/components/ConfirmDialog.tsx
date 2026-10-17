import Modal from './Modal'
import { dangerSolidButtonClass, secondaryButtonClass } from './formStyles'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  loadingLabel: string // Texto mientras se procesa, ej: "Eliminando..."
  isLoading: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  loadingLabel,
  isLoading,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} ariaLabel={title} size="small">
      <div className="pt-8 text-center">
        <h2 className="px-8 text-base font-extrabold uppercase tracking-wide">{title}</h2>
        <p className="mt-3 text-sm text-ink-muted">{message}</p>

        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {/* Cancelar recibe el foco: la opción segura por defecto */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            autoFocus
            className={secondaryButtonClass}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={dangerSolidButtonClass}
          >
            {isLoading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog