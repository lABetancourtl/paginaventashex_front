import { useId, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import FormField from '../../components/FormField'
import { inputClass, readOnlyInputClass } from '../../components/formStyles'
import { formatCOP } from '../../utils/formatters'
import { filterActive } from '../../features/catalog/categoryTree'
import type { AdminCategoryNode } from '../../features/catalog/types'
import { validateProductForm } from '../productForm'
import type { ProductFormErrors, ProductFormValues } from '../productForm'
import { adminPrimaryButtonClass } from '../adminStyles'

const fieldClass = `${inputClass} rounded-lg`
const readOnlyClass = `${readOnlyInputClass} rounded-lg`
const NUMERIC_FIELDS: (keyof ProductFormValues)[] = ['price', 'stock']

interface ProductFormProps {
  mode: 'create' | 'edit'
  initialValues: ProductFormValues
  categories: AdminCategoryNode[]
  categoryName?: string // En la edición, la categoría se muestra como texto
  submitLabel: string
  isSaving: boolean
  serverError: string | null
  onSubmit: (values: ProductFormValues) => void
}

function ProductForm({
  mode,
  initialValues,
  categories,
  categoryName,
  submitLabel,
  isSaving,
  serverError,
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
    onSubmit(values)
  }

  const ariaFor = (field: keyof ProductFormValues) => ({
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${fieldId(field)}-error` : undefined,
  })

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormField id={fieldId('name')} label="Nombre" required error={errors.name}>
          <input
            id={fieldId('name')}
            name="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            maxLength={200}
            disabled={isSaving}
            className={fieldClass}
            {...ariaFor('name')}
          />
        </FormField>
      </div>

      <div className="sm:col-span-2">
        <FormField
          id={fieldId('description')}
          label="Descripción"
          error={errors.description}
          hint={`${values.description.length}/1000 caracteres`}
        >
          <textarea
            id={fieldId('description')}
            name="description"
            value={values.description}
            onChange={handleChange}
            maxLength={1000}
            rows={4}
            disabled={isSaving}
            className={`${fieldClass} resize-y`}
            {...ariaFor('description')}
          />
        </FormField>
      </div>

      <FormField
        id={fieldId('price')}
        label="Precio (COP)"
        required
        error={errors.price}
        hint={values.price ? formatCOP(Number(values.price)) : 'Sin puntos ni comas: 34000'}
      >
        <input
          id={fieldId('price')}
          name="price"
          type="text"
          inputMode="numeric"
          value={values.price}
          onChange={handleChange}
          disabled={isSaving}
          className={fieldClass}
          {...ariaFor('price')}
        />
      </FormField>

      {isCreate ? (
        <FormField
          id={fieldId('sku')}
          label="SKU"
          required
          error={errors.sku}
          hint="Código único. No se puede cambiar después."
        >
          <input
            id={fieldId('sku')}
            name="sku"
            type="text"
            value={values.sku}
            onChange={handleChange}
            maxLength={50}
            disabled={isSaving}
            className={`${fieldClass} font-mono`}
            {...ariaFor('sku')}
          />
        </FormField>
      ) : (
        <FormField id={fieldId('sku')} label="SKU" hint="No se puede cambiar.">
          <input id={fieldId('sku')} type="text" value={values.sku} readOnly className={`${readOnlyClass} font-mono`} />
        </FormField>
      )}

      {isCreate ? (
        <FormField id={fieldId('stock')} label="Unidades disponibles" required error={errors.stock}>
          <input
            id={fieldId('stock')}
            name="stock"
            type="text"
            inputMode="numeric"
            value={values.stock}
            onChange={handleChange}
            disabled={isSaving}
            className={fieldClass}
            {...ariaFor('stock')}
          />
        </FormField>
      ) : (
        <FormField id={fieldId('stock')} label="Unidades disponibles" hint="Por ahora no se puede cambiar.">
          <input id={fieldId('stock')} type="text" value={values.stock} readOnly className={readOnlyClass} />
        </FormField>
      )}

      {isCreate ? (
        <FormField id={fieldId('categoryId')} label="Subcategoría" required error={errors.categoryId}>
          <select
            id={fieldId('categoryId')}
            name="categoryId"
            value={values.categoryId}
            onChange={handleChange}
            disabled={isSaving}
            className={fieldClass}
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
        </FormField>
      ) : (
        <FormField id={fieldId('categoryId')} label="Subcategoría" hint="No se puede cambiar.">
          <input id={fieldId('categoryId')} type="text" value={categoryName ?? ''} readOnly className={readOnlyClass} />
        </FormField>
      )}

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-end">
        {serverError && (
          <p role="alert" className="text-sm text-danger sm:mr-auto">
            {serverError}
          </p>
        )}
        <button type="submit" disabled={isSaving} className={adminPrimaryButtonClass}>
          {isSaving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ProductForm