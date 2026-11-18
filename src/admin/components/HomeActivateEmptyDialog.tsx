import { Link } from 'react-router'
import { AlertTriangle } from 'lucide-react'
import AdminDialog, { AdminDialogBody, AdminDialogFooter } from './AdminDialog'
import type { HomeSectionAdmin } from '../../features/home/types'
import { sectionPath } from '../homeSections'
import { adminPrimaryButtonClass, adminSecondaryButtonClass } from '../adminStyles'

// Aviso antes de activar un bloque vacío (no es destructivo: botón principal)
interface HomeActivateEmptyDialogProps {
  section: HomeSectionAdmin | null
  isLoading: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
  showContentLink?: boolean // Enlace para ir a llenarlo (no hace falta si ya se está ahí)
}

function HomeActivateEmptyDialog({
  section,
  isLoading,
  error,
  onConfirm,
  onCancel,
  showContentLink = true,
}: HomeActivateEmptyDialogProps) {
  const isBanner = section?.type === 'Banner'
  return (
    <AdminDialog
      open={section !== null}
      onClose={isLoading ? () => {} : onCancel}
      title="Este bloque está vacío"
      icon={AlertTriangle}
      iconTone="warning"
      size="sm"
    >
      <AdminDialogBody>
        <p className="text-sm text-ink-muted">
          {isBanner ? 'No tiene imágenes ni videos' : 'No tiene productos'}, así que la tienda no lo mostrará hasta
          que agregues contenido. ¿Activarlo de todas formas?
        </p>
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
      </AdminDialogBody>
      <AdminDialogFooter>
        {section && showContentLink && (
          <Link to={sectionPath(section.id)} className={`${adminSecondaryButtonClass} sm:mr-auto`}>
            Agregar contenido
          </Link>
        )}
        <button type="button" onClick={onCancel} disabled={isLoading} autoFocus className={adminSecondaryButtonClass}>
          Cancelar
        </button>
        <button type="button" onClick={onConfirm} disabled={isLoading} className={adminPrimaryButtonClass}>
          {isLoading ? 'Activando...' : 'Activar'}
        </button>
      </AdminDialogFooter>
    </AdminDialog>
  )
}

export default HomeActivateEmptyDialog
