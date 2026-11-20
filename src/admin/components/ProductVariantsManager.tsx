import { useState } from 'react'
import { Info, Plus, Warehouse } from 'lucide-react'
import {
  useCreateVariant,
  useSetVariantStatus,
  useUpdateVariant,
} from '../../features/catalog/hooks/useVariantMutations'
import type { AdminProductVariant, VariantRequest } from '../../features/catalog/types'
import { getVariantRules } from '../variantRules'
import AdminSwitch from './AdminSwitch'
import VariantFormDialog from './VariantFormDialog'
import type { VariantDialogState } from './VariantFormDialog'
import { adminCountChipClass, adminOutlineButtonClass, adminPanelClass } from '../adminStyles'

const LOW_STOCK = 5

// Columnas: variante · SKU · stock · activa · editar
const gridCols = 'grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_100px_56px_80px]'

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
    [variant.colorName, variant.sizeName].filter(Boolean).join(' · ') || 'Variante única'

  const totalStock = variants.filter((v) => v.isActive).reduce((sum, v) => sum + v.stock, 0)

  const stockOf = (variant: AdminProductVariant) => {
    if (variant.stock <= 0) return { note: 'Agotado', ink: 'text-[#b42318]' }
    if (variant.stock <= LOW_STOCK) return { note: 'Stock bajo', ink: 'text-[#8a5a00]' }
    return { note: '', ink: 'text-admin-ink' }
  }

  const switchOf = (variant: AdminProductVariant, label: string) => (
    <AdminSwitch
      size="sm"
      tone="ink"
      checked={variant.isActive}
      disabled={isUpdating(variant.id)}
      label={variant.isActive ? `Desactivar ${label}` : `Activar ${label}`}
      onChange={() => toggle(variant)}
    />
  )

  return (
    <section id="variantes" className={`${adminPanelClass} scroll-mt-24 overflow-hidden`}>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 px-5 pb-3.5 pt-4">
        <div className="min-w-0 flex-[1_1_200px]">
          <h2 className="text-[15px] font-semibold">Variantes</h2>
          <p className="mt-0.5 text-[13px] text-[#6b6a65]">Cada combinación de talla y color tiene su SKU.</p>
        </div>
        <span className={adminCountChipClass}>Stock total: {totalStock}</span>
        {/* Pendiente: se conectará a la gestión de stock cuando exista en el backend */}
        <button type="button" className={adminOutlineButtonClass}>
          <Warehouse size={14} strokeWidth={1.75} aria-hidden="true" />
          Gestionar stock
        </button>
      </div>

      {/* Guía para convertir un producto simple en uno con tallas o colores */}
      {rules.isSimple && (
        <div className="mx-5 mb-3.5 flex gap-2.5 rounded-[10px] bg-admin-bg px-3 py-2.5 text-xs text-[#4a4945]">
          <Info size={15} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0 text-[#6b6a65]" />
          <p>
            Este producto tiene una sola variante, sin talla ni color. Para venderlo por tallas o colores,{' '}
            <strong className="font-semibold text-admin-ink">edita esta variante</strong> y asígnale su primera talla y
            color. Después podrás agregar las demás.
          </p>
        </div>
      )}

      {/* Computador: tabla en grilla */}
      <div role="table" aria-label="Variantes" className="hidden md:block">
        <div
          role="row"
          className={`grid ${gridCols} items-center gap-4 border-t border-admin-row-line px-5 py-2 text-xs font-medium text-[#8b8a84]`}
        >
          <span role="columnheader">Variante</span>
          <span role="columnheader">SKU</span>
          <span role="columnheader">Stock</span>
          <span role="columnheader">Activa</span>
          <span role="columnheader">
            <span className="sr-only">Acciones</span>
          </span>
        </div>
        {variants.map((variant) => {
          const label = labelOf(variant)
          const { note, ink } = stockOf(variant)
          return (
            <div
              key={variant.id}
              role="row"
              className={`grid ${gridCols} items-center gap-4 border-t border-admin-row-line px-5 py-2.5`}
            >
              <div role="cell" className="flex min-w-0 items-center gap-2.5">
                {variant.colorId !== null ? (
                  <ColorDot hex={variant.colorHexCode} size="size-4" />
                ) : (
                  <span aria-hidden="true" className="size-4 shrink-0" />
                )}
                <span className={`truncate text-sm font-medium ${variant.isActive ? 'text-admin-ink' : 'text-[#8b8a84]'}`}>
                  {label}
                </span>
              </div>
              <span role="cell" className="truncate font-mono text-xs text-[#6b6a65]">
                {variant.sku}
              </span>
              <div role="cell" className="flex flex-col gap-0.5 text-sm">
                <span className={`font-semibold tabular-nums ${ink}`}>{variant.stock} und.</span>
                {note && <span className={`text-[11px] font-medium ${ink}`}>{note}</span>}
              </div>
              <div role="cell" className="flex items-center">
                {switchOf(variant, label)}
              </div>
              <div role="cell" className="flex justify-end">
                <button type="button" onClick={() => openEdit(variant)} aria-label={`Editar ${label}`} className={adminOutlineButtonClass}>
                  Editar
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Celular: tarjetas con controles de 44px */}
      <ul className="md:hidden">
        {variants.map((variant) => {
          const label = labelOf(variant)
          const { note, ink } = stockOf(variant)
          return (
            <li key={variant.id} className="flex flex-col gap-2.5 border-t border-admin-row-line px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                {variant.colorId !== null && <ColorDot hex={variant.colorHexCode} size="size-4" />}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${variant.isActive ? 'text-admin-ink' : 'text-[#8b8a84]'}`}>{label}</p>
                  <p className="truncate font-mono text-[11px] text-[#8b8a84]">{variant.sku}</p>
                </div>
                <div className="flex size-11 items-center justify-center">{switchOf(variant, label)}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={`font-semibold tabular-nums ${ink}`}>{variant.stock} und.</span>
                {note && <span className={`text-xs font-medium ${ink}`}>{note}</span>}
                <div className="flex-1" />
                <button type="button" onClick={() => openEdit(variant)} aria-label={`Editar ${label}`} className={adminOutlineButtonClass}>
                  Editar
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {variants.length === 0 && (
        <p className="border-t border-admin-row-line px-5 py-7 text-center text-sm text-[#6b6a65]">
          Sin variantes, el producto no se puede comprar. Agrega al menos una.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-admin-row-line px-5 pb-4 pt-3">
        {rules.canAdd && (
          <button type="button" onClick={openCreate} className={adminOutlineButtonClass}>
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            Agregar variante
          </button>
        )}
        {setStatus.error ? (
          <p role="alert" className="text-sm text-danger">
            {setStatus.error.message}
          </p>
        ) : (
          !rules.canAdd &&
          !rules.isSimple && (
            <p className="text-xs text-[#8b8a84]">
              Las variantes activas no usan talla ni color, así que no se pueden agregar más.
            </p>
          )
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
    </section>
  )
}

export default ProductVariantsManager
