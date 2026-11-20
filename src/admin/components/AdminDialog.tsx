import type { ReactNode } from 'react'
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { adminIconButtonClass } from '../adminStyles'

type DialogSize = 'sm' | 'md' | 'lg'
type IconTone = 'accent' | 'danger' | 'warning'
type DialogLook = 'default' | 'neutral' // neutral: estilo Tisoro (grises cálidos, sin sombras de color)

const sizeClasses: Record<DialogSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
}

// Recuadro del ícono en el estilo neutral, según el tono
const neutralIconClasses: Record<IconTone, string> = {
  accent: 'bg-admin-hover text-[#3d3c38]',
  danger: 'bg-[#fdecea] text-[#b42318]',
  warning: 'bg-[#fdf3dc] text-[#8a5a00]',
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
  look?: DialogLook
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
  look = 'default',
  children,
}: AdminDialogProps) {
  const isNeutral = look === 'neutral'

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div
        aria-hidden="true"
        className={`fixed inset-0 animate-admin-fade motion-reduce:animate-none ${isNeutral ? 'bg-[#1c1c1a]/40' : 'bg-[#0f172a]/40'}`}
      />

      <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-6">
        <DialogPanel
          className={`flex max-h-[92dvh] w-full animate-admin-pop flex-col will-change-transform motion-reduce:animate-none overflow-hidden bg-white ${
            isNeutral
              ? 'rounded-t-[14px] text-admin-ink shadow-[0_24px_64px_rgb(28_28_26/0.22)] sm:rounded-[14px]'
              : 'rounded-t-2xl text-ink shadow-2xl sm:rounded-2xl'
          } ${sizeClasses[size]}`}
        >
          {/* Encabezado */}
          <div
            className={`flex shrink-0 items-start gap-3 border-b px-5 py-4 sm:px-6 ${
              isNeutral ? 'border-admin-row-line' : 'border-admin-line'
            }`}
          >
            {Icon && (
              <span
                aria-hidden="true"
                className={
                  isNeutral
                    ? `flex size-9 shrink-0 items-center justify-center rounded-[10px] ${neutralIconClasses[iconTone]}`
                    : `flex size-10 shrink-0 items-center justify-center rounded-xl ring-4 ${iconToneClasses[iconTone]}`
                }
              >
                <Icon size={18} strokeWidth={1.75} />
              </span>
            )}
            <div className="min-w-0 flex-1 pt-0.5">
              <DialogTitle className={`font-semibold leading-snug ${isNeutral ? 'text-[15px]' : 'text-base'}`}>{title}</DialogTitle>
              {description && (
                <Description as="div" className={`mt-0.5 text-[13px] ${isNeutral ? 'text-[#6b6a65]' : 'text-ink-muted'}`}>
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
export function AdminDialogFooter({
  children,
  start,
  look = 'default',
}: {
  children: ReactNode
  start?: ReactNode
  look?: DialogLook
}) {
  return (
    <div
      className={`flex shrink-0 flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6 ${
        look === 'neutral' ? 'border-admin-row-line bg-white' : 'border-admin-line bg-admin-bg/60'
      }`}
    >
      {start && <div className="text-xs text-ink-muted sm:mr-auto">{start}</div>}
      {children}
    </div>
  )
}

export default AdminDialog
