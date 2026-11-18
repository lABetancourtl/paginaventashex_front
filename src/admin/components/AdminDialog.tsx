import type { ReactNode } from 'react'
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { adminIconButtonClass } from '../adminStyles'

type DialogSize = 'sm' | 'md' | 'lg'
type IconTone = 'accent' | 'danger' | 'warning'

const sizeClasses: Record<DialogSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
}

const iconToneClasses: Record<IconTone, string> = {
  accent: 'bg-admin-accent/10 text-admin-accent ring-admin-accent/15',
  danger: 'bg-red-50 text-danger ring-red-100',
  warning: 'bg-amber-50 text-amber-600 ring-amber-100',
}

interface AdminDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  icon?: LucideIcon
  iconTone?: IconTone
  size?: DialogSize
  children: ReactNode
}

// Diálogo del panel: celular como hoja inferior, computador como tarjeta centrada
function AdminDialog({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  iconTone = 'accent',
  size = 'md',
  children,
}: AdminDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div aria-hidden="true" className="fixed inset-0 animate-admin-fade bg-[#0f172a]/40 backdrop-blur-[2px]" />

      <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-6">
        <DialogPanel
          className={`flex max-h-[92dvh] w-full animate-admin-pop flex-col overflow-hidden rounded-t-2xl bg-white text-ink shadow-2xl sm:rounded-2xl ${sizeClasses[size]}`}
        >
          {/* Encabezado */}
          <div className="flex shrink-0 items-start gap-3 border-b border-admin-line px-5 py-4 sm:px-6">
            {Icon && (
              <span
                aria-hidden="true"
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ring-4 ${iconToneClasses[iconTone]}`}
              >
                <Icon size={18} strokeWidth={1.75} />
              </span>
            )}
            <div className="min-w-0 flex-1 pt-0.5">
              <DialogTitle className="text-base font-semibold leading-snug">{title}</DialogTitle>
              {description && (
                <Description as="div" className="mt-0.5 text-[13px] text-ink-muted">
                  {description}
                </Description>
              )}
            </div>
            <button type="button" onClick={onClose} aria-label="Cerrar" className={`${adminIconButtonClass} -mr-2 -mt-1`}>
              <X size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          {/* Contenido: el formulario incluye su propio pie */}
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

// Zona con scroll del contenido
export function AdminDialogBody({ children }: { children: ReactNode }) {
  return <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
}

// Pie fijo con los botones
export function AdminDialogFooter({ children, start }: { children: ReactNode; start?: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-admin-line bg-admin-bg/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
      {start && <div className="text-xs text-ink-muted sm:mr-auto">{start}</div>}
      {children}
    </div>
  )
}

export default AdminDialog
