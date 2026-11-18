import { useEffect, useId, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { Link } from 'react-router'
import { Check } from 'lucide-react'
import { formatCOP } from '../../utils/formatters'
import { filterActive } from '../../features/catalog/categoryTree'
import type { AdminCategoryNode } from '../../features/catalog/types'
import { validateProductForm } from '../productForm'
import type { ProductFormErrors, ProductFormValues } from '../productForm'
import AdminField, { AdminInputGroup } from './AdminField'
import {
  adminInputClass,
  adminPrimaryButtonClass,
  adminReadOnlyClass,
  adminSecondaryButtonClass,
} from '../adminStyles'

const NUMERIC_FIELDS: (keyof ProductFormValues)[] = ['price', 'stock']
const DESCRIPTION_MAX = 1000

// Bloque del formulario: título y ayuda a la izquierda, campos a la derecha (si hay espacio)
function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 py-6 first:pt-0 last:pb-0 @3xl:grid-cols-[220px_minmax(0,1fr)] @3xl:gap-8">
      <div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-xs text-ink-muted">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">{children}</div>
    </div>
  )
}

interface ProductFormProps {
  mode: 'create' | 'edit'
  initialValues: ProductFormValues
  categories: AdminCategoryNode[]
  categoryName?: string // En la edición, la categoría se muestra como texto
  submitLabel: string
  isSaving: boolean
  serverError: string | null
  savedNotice?: boolean // Muestra "Cambios guardados" junto al botón
  cancelHref?: string
  formId?: string // Permite enviar el formulario desde un botón externo (barra de guardado)
  onDirtyChange?: (isDirty: boolean) => void
  anotherLabel?: string // Botón extra, ej: "Crear y agregar otro"
  onSubmit: (values: ProductFormValues, options: { another: boolean }) => void
}

function ProductForm({
  mode,
  initialValues,
  categories,
  categoryName,
  submitLabel,
  isSaving,
  serverError,
  savedNotice = false,
  cancelHref,
  formId,
  onDirtyChange,
  anotherLabel,
  onSubmit,
}: ProductFormProps) {
  const baseId = useId()
  const fieldId = (name: keyof ProductFormValues) => `${baseId}-${name}`
  const isCreate = mode === 'create'

  const [values, setValues] = useState<ProductFormValues>(initialValues)
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  // Solo se puede elegir una subcategoría activa con su principal activa
  const selectableRoots = filterActive(categories).filter((root) => root.children.length > 0)

  // ¿Hay cambios sin guardar? (solo importa al editar)
  const isDirty = (Object.keys(values) as (keyof ProductFormValues)[]).some(
    (key) => values[key] !== initialValues[key],
  )

  // Avisa a la página para la barra de guardado y el aviso al salir
  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let clean = value
    if (NUMERIC_FIELDS.includes(name as keyof ProductFormValues)) clean = value.replace(/\D/g, '')
    if (name === 'sku') clean = value.toUpperCase()

    const next = { ...values, [name]: clean } as ProductFormValues
    setValues(next)
    if (submitted) setErrors(validateProductForm(next, isCreate))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
    const validation = validateProductForm(values, isCreate)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return
    // ¿Qué botón lo envió? El de "agregar otro" lleva value="another"
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    onSubmit(values, { another: submitter?.value === 'another' })
  }

  const ariaFor = (field: keyof ProductFormValues) => ({
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${fieldId(field)}-error` : undefined,
  })

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="@container">
      <div className="divide-y divide-admin-line">
        <FormSection title="Información básica" description="El nombre y la descripción que verán los clientes.">
          <div className="@xl:col-span-2">
            <AdminField
              id={fieldId('name')}
              label="Nombre del producto"
              required
              error={errors.name}
              aside={`${values.name.length}/200`}
            >
              <input
                id={fieldId('name')}
                name="name"
                type="text"
                value={values.name}
                onChange={handleChange}
                maxLength={200}
                placeholder="Ej: Pijama de algodón para niño"
                disabled={isSaving}
                className={adminInputClass}
                {...ariaFor('name')}
              />
            </AdminField>
          </div>

          <div className="@xl:col-span-2">
            <AdminField
              id={fieldId('description')}
              label="Descripción"
              error={errors.description}
              aside={`${values.description.length}/${DESCRIPTION_MAX}`}
            >
              <textarea
                id={fieldId('description')}
                name="description"
                value={values.description}
                onChange={handleChange}
                maxLength={DESCRIPTION_MAX}
                rows={5}
                placeholder="Materiales, cuidados, detalles del diseño…"
                disabled={isSaving}
                className={`${adminInputClass} resize-y leading-relaxed`}
                {...ariaFor('description')}
              />
            </AdminField>
          </div>
        </FormSection>

        <FormSection
          title={isCreate ? 'Precio e inventario' : 'Precio'}
          description={
            isCreate
              ? 'El precio de venta y las unidades de la primera variante. Después podrás agregar tallas y colores.'
              : 'El precio de venta antes de descuentos.'
          }
        >
          <AdminField
            id={fieldId('price')}
            label="Precio"
            required
            error={errors.price}
            hint={values.price ? formatCOP(Number(values.price)) : 'Sin puntos ni comas: 34000'}
          >
            <AdminInputGroup prefix="$" suffix="COP">
              <input
                id={fieldId('price')}
                name="price"
                type="text"
                inputMode="numeric"
                value={values.price}
                onChange={handleChange}
                placeholder="0"
                disabled={isSaving}
                className={`${adminInputClass} pl-7 pr-12 tabular-nums`}
                {...ariaFor('price')}
              />
            </AdminInputGroup>
          </AdminField>

          {isCreate && (
            <AdminField id={fieldId('sku')} label="SKU" required error={errors.sku} hint="Código único de la primera variante.">
              <input
                id={fieldId('sku')}
                name="sku"
                type="text"
                value={values.sku}
                onChange={handleChange}
                maxLength={50}
                placeholder="Ej: PIJ-NINO-001"
                disabled={isSaving}
                className={`${adminInputClass} font-mono uppercase`}
                {...ariaFor('sku')}
              />
            </AdminField>
          )}

          {isCreate && (
            <AdminField id={fieldId('stock')} label="Unidades disponibles" required error={errors.stock}>
              <AdminInputGroup suffix="und.">
                <input
                  id={fieldId('stock')}
                  name="stock"
                  type="text"
                  inputMode="numeric"
                  value={values.stock}
                  onChange={handleChange}
                  placeholder="0"
                  disabled={isSaving}
                  className={`${adminInputClass} pr-12 tabular-nums`}
                  {...ariaFor('stock')}
                />
              </AdminInputGroup>
            </AdminField>
          )}
        </FormSection>

        <FormSection title="Organización" description="La subcategoría donde se mostrará en la tienda.">
          {isCreate ? (
            <AdminField id={fieldId('categoryId')} label="Subcategoría" required error={errors.categoryId}>
              <select
                id={fieldId('categoryId')}
                name="categoryId"
                value={values.categoryId}
                onChange={handleChange}
                disabled={isSaving}
                className={adminInputClass}
                {...ariaFor('categoryId')}
              >
                <option value="" disabled hidden>
                  Elige una subcategoría
                </option>
                {selectableRoots.map((root) => (
                  <optgroup key={root.id} label={root.name}>
                    {root.children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </AdminField>
          ) : (
            <AdminField id={fieldId('categoryId')} label="Subcategoría" hint="No se puede cambiar.">
              <input
                id={fieldId('categoryId')}
                type="text"
                value={categoryName ?? ''}
                readOnly
                className={adminReadOnlyClass}
              />
            </AdminField>
          )}
        </FormSection>
      </div>

      {/* Pie con las acciones */}
      <div className="-mx-5 -mb-5 mt-6 flex flex-col gap-3 rounded-b-2xl border-t border-admin-line bg-admin-bg/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
        <div className="text-sm sm:mr-auto">
          {serverError ? (
            <p role="alert" className="text-danger">
              {serverError}
            </p>
          ) : savedNotice && !isDirty ? (
            <p role="status" className="inline-flex items-center gap-1.5 text-green-700">
              <Check size={15} strokeWidth={2} aria-hidden="true" />
              Cambios guardados
            </p>
          ) : !isCreate && isDirty ? (
            <p className="text-ink-muted">Tienes cambios sin guardar.</p>
          ) : null}
        </div>
        {cancelHref && (
          <Link to={cancelHref} className={adminSecondaryButtonClass}>
            Cancelar
          </Link>
        )}
        {anotherLabel && (
          <button type="submit" value="another" disabled={isSaving} className={adminSecondaryButtonClass}>
            {anotherLabel}
          </button>
        )}
        <button type="submit" disabled={isSaving || (!isCreate && !isDirty)} className={adminPrimaryButtonClass}>
          {isSaving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ProductForm
