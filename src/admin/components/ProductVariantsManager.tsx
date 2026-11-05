import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import {
  useCreateVariant,
  useSetVariantStatus,
  useUpdateVariant,
} from '../../features/catalog/hooks/useVariantMutations'
import type { AdminProductVariant, VariantRequest } from '../../features/catalog/types'
import { getVariantRules } from '../variantRules'
import StatusBadge from './StatusBadge'
import StockText from './StockText'
import VariantFormDialog from './VariantFormDialog'
import type { VariantDialogState } from './VariantFormDialog'
import { adminSecondaryButtonClass } from '../adminStyles'

function ColorDot({ hex }: { hex: string | null }) {
  return (
    <span
      aria-hidden="true"
      className={`size-5 shrink-0 rounded-full ring-1 ring-line ${hex ? '' : 'border border-dashed border-ink-muted/50'}`}
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

  return (
    <div className="space-y-4">
      {/* Guía para convertir un producto simple en uno con tallas o colores */}
      {rules.isSimple && (
        <p className="rounded-lg bg-canvas px-3 py-2 text-xs text-ink-muted">
          Este producto tiene una sola variante, sin talla ni color. Para venderlo por tallas o colores,{' '}
          <strong className="text-ink">edita esta variante</strong> y asígnale su primera talla y color.
          Después podrás agregar las demás.
        </p>
      )}

      <ul className="divide-y divide-line/60">
        {variants.map((variant) => {
          const label = [variant.sizeName, variant.colorName].filter(Boolean).join(' · ') || 'Variante única'

          return (
            <li key={variant.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              {/* Atenuada si está desactivada */}
              <div className={`flex min-w-0 flex-1 items-center gap-3 ${variant.isActive ? '' : 'opacity-50'}`}>
                {variant.colorId !== null && <ColorDot hex={variant.colorHexCode} />}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="truncate font-mono text-xs text-ink-muted">{variant.sku}</p>
                </div>
              </div>

              <span className="w-20 text-sm">
                <StockText stock={variant.stock} />
              </span>

              <StatusBadge tone={variant.isActive ? 'success' : 'neutral'}>
                {variant.isActive ? 'Activa' : 'Inactiva'}
              </StatusBadge>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(variant)}
                  aria-label={`Editar ${label}`}
                  title="Editar"
                  className="rounded-md p-1.5 text-ink-muted hover:bg-canvas hover:text-ink"
                >
                  <Pencil size={16} strokeWidth={1.5} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setStatus.mutate({ productId, variantId: variant.id, active: !variant.isActive })
                  }
                  disabled={isUpdating(variant.id)}
                  className={`${adminSecondaryButtonClass} w-24`}
                >
                  {isUpdating(variant.id) ? 'Guardando...' : variant.isActive ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {setStatus.error && (
        <p role="alert" className="text-sm text-danger">
          {setStatus.error.message}
        </p>
      )}

      {rules.canAdd ? (
        <button type="button" onClick={openCreate} className={adminSecondaryButtonClass}>
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          Agregar variante
        </button>
      ) : (
        !rules.isSimple && (
          <p className="text-xs text-ink-muted">
            Las variantes activas no usan talla ni color, así que no se pueden agregar más.
          </p>
        )
      )}

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