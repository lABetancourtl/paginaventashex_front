import { useState } from 'react'
import { Eye, EyeOff, Info, Pencil, Plus } from 'lucide-react'
import {
  useCreateVariant,
  useSetVariantStatus,
  useUpdateVariant,
} from '../../features/catalog/hooks/useVariantMutations'
import type { AdminProductVariant, VariantRequest } from '../../features/catalog/types'
import { getVariantRules } from '../variantRules'
import StatusBadge from './StatusBadge'
import StockText from './StockText'
import AdminActionMenu from './AdminActionMenu'
import VariantFormDialog from './VariantFormDialog'
import type { VariantDialogState } from './VariantFormDialog'
import { adminSecondaryButtonClass, adminTdClass, adminThClass } from '../adminStyles'

export function ColorDot({ hex, size = 'size-5' }: { hex: string | null; size?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`${size} shrink-0 rounded-full ring-1 ring-black/10 ${hex ? '' : 'border border-dashed border-ink-muted/50'}`}
      style={hex ? { backgroundColor: hex } : undefined}
    />
  )
}

interface ProductVariantsManagerProps {
  productId: number
  variants: AdminProductVariant[]
}

function ProductVariantsManager({ productId, variants }: ProductVariantsManagerProps) {
  const rules = getVariantRules(variants)

  const createVariant = useCreateVariant()
  const updateVariant = useUpdateVariant()
  const setStatus = useSetVariantStatus()

  const [dialog, setDialog] = useState<VariantDialogState | null>(null)
  const activeSave = dialog?.mode === 'edit' ? updateVariant : createVariant

  const openCreate = () => {
    createVariant.reset()
    setDialog({ mode: 'create' })
  }

  const openEdit = (variant: AdminProductVariant) => {
    updateVariant.reset()
    setDialog({ mode: 'edit', variant })
  }

  const closeDialog = () => setDialog(null)

  const handleSubmit = (request: VariantRequest) => {
    if (!dialog) return
    if (dialog.mode === 'create') {
      createVariant.mutate({ productId, request }, { onSuccess: closeDialog })
    } else {
      updateVariant.mutate(
        { productId, variantId: dialog.variant.id, request },
        { onSuccess: closeDialog },
      )
    }
  }

  const isUpdating = (id: number) => setStatus.isPending && setStatus.variables?.variantId === id
  const toggle = (variant: AdminProductVariant) =>
    setStatus.mutate({ productId, variantId: variant.id, active: !variant.isActive })

  const labelOf = (variant: AdminProductVariant) =>
    [variant.sizeName, variant.colorName].filter(Boolean).join(' · ') || 'Variante única'

  const actionsOf = (variant: AdminProductVariant) => {
    const busy = isUpdating(variant.id)
    return [
      { label: 'Editar', icon: Pencil, onClick: () => openEdit(variant) },
      'separator' as const,
      variant.isActive
        ? { label: busy ? 'Guardando…' : 'Desactivar', icon: EyeOff, onClick: () => toggle(variant), danger: true, disabled: busy }
        : { label: busy ? 'Guardando…' : 'Activar', icon: Eye, onClick: () => toggle(variant), disabled: busy },
    ]
  }

  return (
    <div>
      {/* Guía para convertir un producto simple en uno con tallas o colores */}
      {rules.isSimple && (
        <div className="mx-5 mt-5 flex gap-2.5 rounded-xl border border-admin-accent/20 bg-admin-accent/5 px-3 py-2.5 text-xs text-ink">
          <Info size={15} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0 text-admin-accent" />
          <p>
            Este producto tiene una sola variante, sin talla ni color. Para venderlo por tallas o colores,{' '}
            <strong>edita esta variante</strong> y asígnale su primera talla y color. Después podrás agregar las
            demás.
          </p>
        </div>
      )}

      {/* Computador: tabla */}
      <div className="mt-2 hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead className="border-b border-admin-line">
            <tr>
              <th scope="col" className={`${adminThClass} pl-5`}>Variante</th>
              <th scope="col" className={adminThClass}>SKU</th>
              <th scope="col" className={adminThClass}>Unidades</th>
              <th scope="col" className={adminThClass}>Estado</th>
              <th scope="col" className={`${adminThClass} pr-5 text-right`}>Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-line">
            {variants.map((variant) => {
              const label = labelOf(variant)
              return (
                <tr key={variant.id} className="transition-colors hover:bg-admin-bg/50">
                  <td className={`${adminTdClass} pl-5`}>
                    <div className={`flex items-center gap-3 ${variant.isActive ? '' : 'opacity-50'}`}>
                      {variant.colorId !== null ? (
                        <ColorDot hex={variant.colorHexCode} />
                      ) : (
                        <span aria-hidden="true" className="size-5 shrink-0" />
                      )}
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  </td>
                  <td className={adminTdClass}>
                    <span className="rounded-md bg-admin-bg px-1.5 py-0.5 font-mono text-xs text-ink-muted">
                      {variant.sku}
                    </span>
                  </td>
                  <td className={`${adminTdClass} text-sm`}>
                    <StockText stock={variant.stock} />
                  </td>
                  <td className={adminTdClass}>
                    <StatusBadge tone={variant.isActive ? 'success' : 'neutral'}>
                      {variant.isActive ? 'Activa' : 'Inactiva'}
                    </StatusBadge>
                  </td>
                  <td className={`${adminTdClass} pr-5 text-right`}>
                    <AdminActionMenu label={`Acciones de ${label}`} items={actionsOf(variant)} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Celular: lista */}
      <ul className="mt-2 divide-y divide-admin-line sm:hidden">
        {variants.map((variant) => {
          const label = labelOf(variant)
          return (
            <li key={variant.id} className="flex items-center gap-3 px-4 py-3">
              <div className={`flex min-w-0 flex-1 items-center gap-3 ${variant.isActive ? '' : 'opacity-50'}`}>
                {variant.colorId !== null && <ColorDot hex={variant.colorHexCode} />}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="truncate font-mono text-xs text-ink-muted">{variant.sku}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <StockText stock={variant.stock} />
                    <StatusBadge tone={variant.isActive ? 'success' : 'neutral'}>
                      {variant.isActive ? 'Activa' : 'Inactiva'}
                    </StatusBadge>
                  </div>
                </div>
              </div>
              <AdminActionMenu label={`Acciones de ${label}`} items={actionsOf(variant)} />
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col gap-3 border-t border-admin-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        {setStatus.error ? (
          <p role="alert" className="text-sm text-danger">
            {setStatus.error.message}
          </p>
        ) : !rules.canAdd && !rules.isSimple ? (
          <p className="text-xs text-ink-muted">
            Las variantes activas no usan talla ni color, así que no se pueden agregar más.
          </p>
        ) : (
          <span />
        )}

        {rules.canAdd && (
          <button type="button" onClick={openCreate} className={adminSecondaryButtonClass}>
            <Plus size={15} strokeWidth={2} aria-hidden="true" />
            Agregar variante
          </button>
        )}
      </div>

      <VariantFormDialog
        state={dialog}
        rules={rules}
        isSaving={activeSave.isPending}
        serverError={activeSave.error?.message ?? null}
        onSubmit={handleSubmit}
        onClose={closeDialog}
      />
    </div>
  )
}

export default ProductVariantsManager
