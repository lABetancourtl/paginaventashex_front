import { AlertTriangle } from 'lucide-react'
import AdminDialog, { AdminDialogBody, AdminDialogFooter } from './AdminDialog'
import { adminDangerButtonClass, adminSecondaryButtonClass } from '../adminStyles'

interface AdminConfirmDialogProps {
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

// Confirmación de una acción destructiva, con el estilo del panel
function AdminConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  loadingLabel,
  isLoading,
  error,
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  return (
    <AdminDialog
      open={isOpen}
      onClose={isLoading ? () => {} : onCancel}
      title={title}
      icon={AlertTriangle}
      iconTone="danger"
      size="sm"
    >
      <AdminDialogBody>
        <p className="text-sm text-ink-muted">{message}</p>
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
      </AdminDialogBody>
      <AdminDialogFooter>
        {/* Cancelar recibe el foco: la opción segura por defecto */}
        <button type="button" onClick={onCancel} disabled={isLoading} autoFocus className={adminSecondaryButtonClass}>
          Cancelar
        </button>
        <button type="button" onClick={onConfirm} disabled={isLoading} className={adminDangerButtonClass}>
          {isLoading ? loadingLabel : confirmLabel}
        </button>
      </AdminDialogFooter>
    </AdminDialog>
  )
}

export default AdminConfirmDialog
