import { AlertTriangle } from 'lucide-react'
import AdminDialog, { AdminDialogBody, AdminDialogFooter } from './AdminDialog'
import { adminDangerSolidButtonClass, adminOutlineButtonClass } from '../adminStyles'

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
      look="neutral"
    >
      <AdminDialogBody>
        <p className="text-sm text-[#6b6a65]">{message}</p>
        {error && (
          <p role="alert" className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
      </AdminDialogBody>
      <AdminDialogFooter look="neutral">
        {/* Cancelar recibe el foco: la opción segura por defecto */}
        <button type="button" onClick={onCancel} disabled={isLoading} autoFocus className={adminOutlineButtonClass}>
          Cancelar
        </button>
        <button type="button" onClick={onConfirm} disabled={isLoading} className={adminDangerSolidButtonClass}>
          {isLoading ? loadingLabel : confirmLabel}
        </button>
      </AdminDialogFooter>
    </AdminDialog>
  )
}

export default AdminConfirmDialog
