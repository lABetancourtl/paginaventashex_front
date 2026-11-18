import { useId, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Check, Layers, Pencil } from 'lucide-react'
import { useColors, useSizes } from '../../features/catalog/hooks/useAttributes'
import { SIZE_GROUP_LABELS, SIZE_GROUP_VALUES } from '../../features/catalog/sizeGroups'
import type { AdminProductVariant, SizeGroup, VariantRequest } from '../../features/catalog/types'
import type { AttributeMode, VariantRules } from '../variantRules'
import AdminDialog, { AdminDialogBody, AdminDialogFooter } from './AdminDialog'
import AdminField, { AdminInputGroup } from './AdminField'
import { ColorDot } from './ProductVariantsManager'
import { adminInputClass, adminPrimaryButtonClass, adminSecondaryButtonClass } from '../adminStyles'

export type VariantDialogState = { mode: 'create' } | { mode: 'edit'; variant: AdminProductVariant }

// ─── Grupo de opciones como fichas (radios accesibles) ──────
interface ChipGroupProps {
  legend: string
  required?: boolean
  error?: string
  hint?: ReactNode
  children: ReactNode
}

function ChipGroup({ legend, required = false, error, hint, children }: ChipGroupProps) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-[13px] font-medium text-ink">
        {legend}
        {required && (
          <span aria-hidden="true" className="text-danger">
            {' '}*
          </span>
        )}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
      {hint && !error && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
    </fieldset>
  )
}

interface ChipProps {
  name: string
  checked: boolean
  disabled?: boolean
  onChange: () => void
  children: ReactNode
}

function Chip({ name, checked, disabled = false, onChange, children }: ChipProps) {
  return (
    <label
      className={`relative inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-admin-accent ${
        checked
          ? 'border-admin-accent bg-admin-accent/10 font-medium text-admin-accent'
          : 'border-admin-line bg-white text-ink hover:border-ink/25'
      } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />
      {children}
    </label>
  )
}

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

  const handleGroupChange = (value: SizeGroup | '') => {
    setGroup(value)
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
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <AdminDialogBody>
        {/* Talla y color de solo lectura cuando el producto tiene varias variantes */}
        {current && !attributesEditable && (
          <div className="rounded-xl border border-admin-line bg-admin-bg/60 p-3">
            <div className="flex items-center gap-3">
              {current.colorId !== null && <ColorDot hex={current.colorHexCode} size="size-8" />}
              <div>
                <p className="text-sm font-medium">
                  {current.sizeName ?? 'Sin talla'} · {current.colorName ?? 'Sin color'}
                </p>
                <p className="text-xs text-ink-muted">
                  Con varias variantes, la talla y el color no se cambian: desactiva esta y crea otra.
                </p>
              </div>
            </div>
          </div>
        )}

        {showSize && (
          <>
            <ChipGroup
              legend="Grupo de tallas"
              hint={groupLocked ? 'Las demás variantes usan este grupo.' : undefined}
            >
              {sizeMode !== 'required' && (
                <Chip
                  name={`${baseId}-group`}
                  checked={group === ''}
                  disabled={isSaving || groupLocked}
                  onChange={() => handleGroupChange('')}
                >
                  Sin talla
                </Chip>
              )}
              {SIZE_GROUP_VALUES.map((value) => (
                <Chip
                  key={value}
                  name={`${baseId}-group`}
                  checked={group === value}
                  disabled={isSaving || (groupLocked && group !== value)}
                  onChange={() => handleGroupChange(value)}
                >
                  {SIZE_GROUP_LABELS[value]}
                </Chip>
              ))}
            </ChipGroup>

            {group !== '' && (
              <ChipGroup legend="Talla" required={sizeMode === 'required'} error={errors.size}>
                {sizes.isPending ? (
                  <p className="text-sm text-ink-muted">Cargando tallas…</p>
                ) : sizes.data && sizes.data.length > 0 ? (
                  sizes.data.map((size) => (
                    <Chip
                      key={size.id}
                      name={`${baseId}-size`}
                      checked={sizeId === String(size.id)}
                      disabled={isSaving}
                      onChange={() => setSizeId(String(size.id))}
                    >
                      {size.name}
                    </Chip>
                  ))
                ) : (
                  <p className="text-sm text-ink-muted">No hay tallas activas en este grupo.</p>
                )}
              </ChipGroup>
            )}
          </>
        )}

        {showColor && (
          <ChipGroup legend="Color" required={colorMode === 'required'} error={errors.color}>
            {colorMode !== 'required' && (
              <Chip name={`${baseId}-color`} checked={colorId === ''} disabled={isSaving} onChange={() => setColorId('')}>
                Sin color
              </Chip>
            )}
            {colors.isPending ? (
              <p className="text-sm text-ink-muted">Cargando colores…</p>
            ) : (
              colors.data?.map((color) => {
                const checked = colorId === String(color.id)
                return (
                  <Chip
                    key={color.id}
                    name={`${baseId}-color`}
                    checked={checked}
                    disabled={isSaving}
                    onChange={() => setColorId(String(color.id))}
                  >
                    <span className="relative flex">
                      <ColorDot hex={color.hexCode} size="size-4" />
                      {checked && (
                        <Check
                          size={10}
                          strokeWidth={3}
                          aria-hidden="true"
                          className="absolute inset-0 m-auto text-white mix-blend-difference"
                        />
                      )}
                    </span>
                    {color.name}
                  </Chip>
                )
              })
            )}
          </ChipGroup>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminField id={`${baseId}-sku`} label="SKU" required error={errors.sku}>
            <input
              id={`${baseId}-sku`}
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              maxLength={50}
              placeholder="Ej: PIJ-NINO-6-AZUL"
              disabled={isSaving}
              autoFocus={current !== null}
              aria-invalid={errors.sku ? true : undefined}
              className={`${adminInputClass} font-mono`}
            />
          </AdminField>
          <AdminField id={`${baseId}-stock`} label="Unidades" required error={errors.stock}>
            <AdminInputGroup suffix="und.">
              <input
                id={`${baseId}-stock`}
                value={stock}
                onChange={(e) => setStock(e.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                placeholder="0"
                disabled={isSaving}
                aria-invalid={errors.stock ? true : undefined}
                className={`${adminInputClass} pr-12 tabular-nums`}
              />
            </AdminInputGroup>
          </AdminField>
        </div>

        {serverError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-danger">
            {serverError}
          </p>
        )}
      </AdminDialogBody>

      <AdminDialogFooter>
        <button type="button" onClick={onCancel} disabled={isSaving} className={adminSecondaryButtonClass}>
          Cancelar
        </button>
        <button type="submit" disabled={isSaving} className={adminPrimaryButtonClass}>
          {isSaving ? 'Guardando...' : current ? 'Guardar cambios' : 'Agregar variante'}
        </button>
      </AdminDialogFooter>
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
  const isEdit = state?.mode === 'edit'

  return (
    <AdminDialog
      open={state !== null}
      onClose={isSaving ? () => {} : onClose}
      title={isEdit ? 'Editar variante' : 'Nueva variante'}
      description={isEdit ? state.variant.sku : 'Una combinación de talla y color con su propio stock.'}
      icon={isEdit ? Pencil : Layers}
      size="lg"
    >
      {state && (
        <VariantForm
          state={state}
          rules={rules}
          isSaving={isSaving}
          serverError={serverError}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      )}
    </AdminDialog>
  )
}

export default VariantFormDialog
