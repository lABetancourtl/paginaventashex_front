import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import Modal from '../../components/Modal'
import FormField from '../../components/FormField'
import { inputClass, readOnlyInputClass } from '../../components/formStyles'
import { useColors, useSizes } from '../../features/catalog/hooks/useAttributes'
import { SIZE_GROUP_LABELS, SIZE_GROUP_VALUES } from '../../features/catalog/sizeGroups'
import type { AdminProductVariant, SizeGroup, VariantRequest } from '../../features/catalog/types'
import type { AttributeMode, VariantRules } from '../variantRules'
import { adminPrimaryButtonClass, adminSecondaryButtonClass } from '../adminStyles'

const fieldClass = `${inputClass} rounded-lg`
const readOnlyClass = `${readOnlyInputClass} rounded-lg`

export type VariantDialogState = { mode: 'create' } | { mode: 'edit'; variant: AdminProductVariant }

// ─── El formulario ──────────────────────────────────────────
interface VariantFormProps {
  state: VariantDialogState
  rules: VariantRules
  isSaving: boolean
  serverError: string | null
  onSubmit: (request: VariantRequest) => void
  onCancel: () => void
}

function VariantForm({ state, rules, isSaving, serverError, onSubmit, onCancel }: VariantFormProps) {
  const baseId = useId()
  const current = state.mode === 'edit' ? state.variant : null

  // ¿Se pueden elegir talla y color en este formulario?
  const attributesEditable = current === null || rules.canEditAttributes
  // Al editar la única variante, los atributos son libres; al agregar, mandan las reglas
  const sizeMode: AttributeMode = current ? 'optional' : rules.sizeMode
  const colorMode: AttributeMode = current ? 'optional' : rules.colorMode
  const groupLocked = current === null && rules.lockedGroup !== null

  const [group, setGroup] = useState<SizeGroup | ''>(current?.sizeGroup ?? rules.lockedGroup ?? '')
  const [sizeId, setSizeId] = useState(current?.sizeId ? String(current.sizeId) : '')
  const [colorId, setColorId] = useState(current?.colorId ? String(current.colorId) : '')
  const [sku, setSku] = useState(current?.sku ?? '')
  const [stock, setStock] = useState(current ? String(current.stock) : '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const showSize = attributesEditable && sizeMode !== 'hidden'
  const showColor = attributesEditable && colorMode !== 'hidden'

  // Solo las tallas y colores activos se ofrecen para variantes nuevas
  const sizes = useSizes({ sizeGroup: group || undefined }, showSize && group !== '')
  const colors = useColors(false, showColor)
  const selectedColor = colors.data?.find((color) => String(color.id) === colorId)

  const handleGroupChange = (value: string) => {
    setGroup(value as SizeGroup | '')
    setSizeId('') // Las tallas cambian con el grupo
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const next: Record<string, string> = {}
    if (showSize && sizeMode === 'required' && sizeId === '') next.size = 'Elige una talla.'
    if (showColor && colorMode === 'required' && colorId === '') next.color = 'Elige un color.'
    if (sku.trim() === '') next.sku = 'Escribe el SKU.'
    if (stock === '') next.stock = 'Escribe las unidades (puede ser 0).'

    setErrors(next)
    if (Object.keys(next).length > 0) return

    onSubmit({
      // Si los atributos no se pueden cambiar, se reenvían los actuales (el PUT reemplaza todo)
      sizeId: attributesEditable ? (showSize && sizeId ? Number(sizeId) : null) : (current?.sizeId ?? null),
      colorId: attributesEditable ? (showColor && colorId ? Number(colorId) : null) : (current?.colorId ?? null),
      sku: sku.trim().toUpperCase(),
      stock: Number(stock),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Talla y color de solo lectura cuando el producto tiene varias variantes */}
      {current && !attributesEditable && (
        <div className="grid grid-cols-2 gap-3">
          <FormField id={`${baseId}-ro-size`} label="Talla">
            <input id={`${baseId}-ro-size`} value={current.sizeName ?? 'Sin talla'} readOnly className={readOnlyClass} />
          </FormField>
          <FormField id={`${baseId}-ro-color`} label="Color">
            <input id={`${baseId}-ro-color`} value={current.colorName ?? 'Sin color'} readOnly className={readOnlyClass} />
          </FormField>
          <p className="col-span-2 -mt-2 text-xs text-ink-muted">
            Con varias variantes, la talla y el color no se cambian: desactiva esta y crea otra.
          </p>
        </div>
      )}

      {showSize && (
        <div className="grid grid-cols-2 gap-3">
          <FormField id={`${baseId}-group`} label="Grupo de tallas">
            <select
              id={`${baseId}-group`}
              value={group}
              onChange={(e) => handleGroupChange(e.target.value)}
              disabled={isSaving || groupLocked}
              className={groupLocked ? readOnlyClass : fieldClass}
            >
              <option value="">{sizeMode === 'required' ? 'Elige un grupo' : 'Sin talla'}</option>
              {SIZE_GROUP_VALUES.map((value) => (
                <option key={value} value={value}>
                  {SIZE_GROUP_LABELS[value]}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id={`${baseId}-size`} label="Talla" required={sizeMode === 'required'} error={errors.size}>
            <select
              id={`${baseId}-size`}
              value={sizeId}
              onChange={(e) => setSizeId(e.target.value)}
              disabled={isSaving || group === ''}
              className={fieldClass}
            >
              <option value="">{group === '' ? 'Primero el grupo' : 'Elige una talla'}</option>
              {sizes.data?.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      )}

      {showColor && (
        <FormField id={`${baseId}-color`} label="Color" required={colorMode === 'required'} error={errors.color}>
          <div className="flex items-center gap-3">
            <select
              id={`${baseId}-color`}
              value={colorId}
              onChange={(e) => setColorId(e.target.value)}
              disabled={isSaving}
              className={fieldClass}
            >
              <option value="">{colorMode === 'required' ? 'Elige un color' : 'Sin color'}</option>
              {colors.data?.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.name}
                </option>
              ))}
            </select>
            {/* Un <option> no puede mostrar colores: la muestra va al lado */}
            {selectedColor?.hexCode && (
              <span
                aria-hidden="true"
                className="size-8 shrink-0 rounded-full ring-1 ring-line"
                style={{ backgroundColor: selectedColor.hexCode }}
              />
            )}
          </div>
        </FormField>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormField id={`${baseId}-sku`} label="SKU" required error={errors.sku}>
          <input
            id={`${baseId}-sku`}
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            maxLength={50}
            disabled={isSaving}
            autoFocus={current !== null}
            className={`${fieldClass} font-mono`}
          />
        </FormField>
        <FormField id={`${baseId}-stock`} label="Unidades" required error={errors.stock}>
          <input
            id={`${baseId}-stock`}
            value={stock}
            onChange={(e) => setStock(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            disabled={isSaving}
            className={fieldClass}
          />
        </FormField>
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-danger">
          {serverError}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} disabled={isSaving} className={adminSecondaryButtonClass}>
          Cancelar
        </button>
        <button type="submit" disabled={isSaving} className={adminPrimaryButtonClass}>
          {isSaving ? 'Guardando...' : current ? 'Guardar cambios' : 'Agregar variante'}
        </button>
      </div>
    </form>
  )
}

// ─── El modal ───────────────────────────────────────────────
interface VariantFormDialogProps {
  state: VariantDialogState | null
  rules: VariantRules
  isSaving: boolean
  serverError: string | null
  onSubmit: (request: VariantRequest) => void
  onClose: () => void
}

function VariantFormDialog({ state, rules, isSaving, serverError, onSubmit, onClose }: VariantFormDialogProps) {
  const title = state?.mode === 'edit' ? 'Editar variante' : 'Nueva variante'

  return (
    <Modal isOpen={state !== null} onClose={onClose} ariaLabel={title} size="small">
      {state && (
        <div className="pt-4">
          <h2 className="mb-5 pr-8 text-lg font-bold tracking-tight">{title}</h2>
          <VariantForm
            state={state}
            rules={rules}
            isSaving={isSaving}
            serverError={serverError}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      )}
    </Modal>
  )
}

export default VariantFormDialog