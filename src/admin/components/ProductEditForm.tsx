import { useEffect, useId, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { formatCOP } from '../../utils/formatters'
import type { Product } from '../../features/catalog/types'
import { toProductEditValues, validateProductForm } from '../productForm'
import type { ProductEditValues, ProductFormErrors, ProductFormValues } from '../productForm'
import { adminPanelClass, adminTextFieldClass } from '../adminStyles'

const NAME_MAX = 200
const DESCRIPTION_MAX = 1000
const DISCOUNT_OPTIONS = [0, 10, 15, 20, 30, 50]

function Panel({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className={`${adminPanelClass} scroll-mt-24`}>
      <h2 className="px-5 pt-4 text-[15px] font-semibold">{title}</h2>
      <div className="px-5 pb-5 pt-4">{children}</div>
    </section>
  )
}

function FieldLabel({ htmlFor, label, count }: { htmlFor: string; label: string; count?: string }) {
  return (
    <span className="mb-1.5 flex justify-between text-[13px] font-medium">
      <label htmlFor={htmlFor}>{label}</label>
      {count && <span className="font-normal tabular-nums text-[#9a9993]">{count}</span>}
    </span>
  )
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-danger">
      {error}
    </p>
  )
}

interface ProductEditFormProps {
  formId: string
  product: Product
  isSaving: boolean
  serverError: string | null
  onDirtyChange: (isDirty: boolean) => void
  onSubmit: (values: ProductEditValues) => void
}

// Información y precio del producto: se guardan juntos desde la barra de guardado
function ProductEditForm({ formId, product, isSaving, serverError, onDirtyChange, onSubmit }: ProductEditFormProps) {
  const baseId = useId()
  const [initial] = useState(() => toProductEditValues(product))
  const [values, setValues] = useState(initial.form)
  const [discount, setDiscount] = useState(initial.discount)
  // Descuento escrito a mano (cuando no es uno de los atajos)
  const [customDiscount, setCustomDiscount] = useState(
    DISCOUNT_OPTIONS.includes(initial.discount) ? '' : String(initial.discount),
  )
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const isDirty =
    discount !== initial.discount ||
    (Object.keys(values) as (keyof ProductFormValues)[]).some((key) => values[key] !== initial.form[key])

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const clean = name === 'price' ? value.replace(/\D/g, '') : value
    const next = { ...values, [name]: clean }
    setValues(next)
    if (submitted) setErrors(validateProductForm(next, false))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
    const validation = validateProductForm(values, false)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return
    onSubmit({ form: values, discount })
  }

  const ids = {
    name: `${baseId}-name`,
    description: `${baseId}-description`,
    price: `${baseId}-price`,
  }
  const invalid = (field: keyof ProductFormValues) => ({
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${ids[field as keyof typeof ids]}-error` : undefined,
  })

  const pickDiscount = (option: number) => {
    setDiscount(option)
    setCustomDiscount('')
  }

  // Solo enteros de 1 a 99; vacío o 0 = sin descuento
  const handleCustomDiscount = (e: ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 2).replace(/^0+/, '')
    setCustomDiscount(clean)
    setDiscount(clean === '' ? 0 : Number(clean))
  }

  const isCustomActive = customDiscount !== ''

  // Vista previa: el backend redondea a pesos enteros
  const price = Number(values.price) || 0
  const finalPrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : price

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5 md:gap-5">
      <Panel id="informacion" title="Información">
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel htmlFor={ids.name} label="Nombre" count={`${values.name.length}/${NAME_MAX}`} />
            <input
              id={ids.name}
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              maxLength={NAME_MAX}
              disabled={isSaving}
              className={`${adminTextFieldClass} h-10`}
              {...invalid('name')}
            />
            <FieldError id={`${ids.name}-error`} error={errors.name} />
          </div>

          <div>
            <FieldLabel
              htmlFor={ids.description}
              label="Descripción"
              count={`${values.description.length}/${DESCRIPTION_MAX}`}
            />
            <textarea
              id={ids.description}
              name="description"
              value={values.description}
              onChange={handleChange}
              maxLength={DESCRIPTION_MAX}
              rows={4}
              disabled={isSaving}
              aria-describedby={`${ids.description}-hint`}
              className={`${adminTextFieldClass} resize-y py-2.5 leading-normal`}
            />
            {errors.description ? (
              <FieldError id={`${ids.description}-error`} error={errors.description} />
            ) : (
              <p id={`${ids.description}-hint`} className="mt-1.5 text-xs text-[#8b8a84]">
                Material, ajuste y cuidados. Es lo que más preguntan los clientes.
              </p>
            )}
          </div>
        </div>
      </Panel>

      <Panel id="precio" title="Precio y descuento">
        <div className="flex flex-wrap gap-x-5 gap-y-4">
          <div className="flex-[1_1_200px]">
            <FieldLabel htmlFor={ids.price} label="Precio de venta" />
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#8b8a84]">$</span>
              <input
                id={ids.price}
                name="price"
                type="text"
                inputMode="numeric"
                value={values.price}
                onChange={handleChange}
                disabled={isSaving}
                className={`${adminTextFieldClass} h-10 pl-7 pr-12 tabular-nums`}
                {...invalid('price')}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-[#9a9993]">
                COP
              </span>
            </div>
            <FieldError id={`${ids.price}-error`} error={errors.price} />
          </div>

          <div className="flex-[1.4_1_260px]">
            <span id={`${baseId}-discount`} className="mb-1.5 block text-[13px] font-medium">
              Descuento
            </span>
            <div role="radiogroup" aria-labelledby={`${baseId}-discount`} className="flex flex-wrap gap-1.5">
              {DISCOUNT_OPTIONS.map((option) => {
                const isActive = !isCustomActive && option === discount
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => pickDiscount(option)}
                    disabled={isSaving}
                    className={`h-10 min-w-[52px] rounded-[9px] border px-3 text-[13px] font-medium tabular-nums transition-colors disabled:opacity-60 ${
                      isActive
                        ? 'border-admin-ink bg-admin-ink text-white'
                        : 'border-[#e2e1dc] bg-white text-[#3d3c38] hover:border-[#cbcac4]'
                    }`}
                  >
                    {option === 0 ? 'Sin' : `${option}%`}
                  </button>
                )
              })}
              <label
                className={`flex h-10 w-[92px] items-center gap-1 rounded-[9px] border px-3 transition-colors focus-within:ring-4 focus-within:ring-admin-accent/10 ${
                  isCustomActive
                    ? 'border-admin-ink bg-white'
                    : 'border-[#e2e1dc] bg-white hover:border-[#cbcac4] focus-within:border-admin-accent'
                }`}
              >
                <span className="sr-only">Otro porcentaje de descuento</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customDiscount}
                  onChange={handleCustomDiscount}
                  placeholder="Otro"
                  disabled={isSaving}
                  className="w-full min-w-0 border-0 bg-transparent p-0 text-[13px] font-medium tabular-nums text-admin-ink placeholder:font-normal placeholder:text-[#9a9993] focus:outline-none"
                />
                <span className="text-[13px] text-[#8b8a84]">%</span>
              </label>
            </div>
            <p className="mt-1.5 text-xs text-[#8b8a84]">Elige un atajo o escribe otro porcentaje (1 a 99).</p>
          </div>

          <div className="flex basis-full flex-wrap items-center gap-x-4 gap-y-2 rounded-[10px] bg-admin-bg px-4 py-3.5">
            <div className="flex flex-col">
              <span className="text-xs text-[#6b6a65]">Precio que ve el cliente</span>
              <span className="flex items-baseline gap-2">
                <span className="text-xl font-semibold tracking-tight tabular-nums">{formatCOP(finalPrice)}</span>
                {discount > 0 && (
                  <span className="text-[13px] tabular-nums text-[#8b8a84] line-through">{formatCOP(price)}</span>
                )}
              </span>
            </div>
            {discount > 0 && (
              <span className="rounded-[10px] bg-[#e8f5ec] px-2 py-0.5 text-xs font-semibold text-[#1f7a45]">
                −{discount}% · ahorra {formatCOP(price - finalPrice)}
              </span>
            )}
          </div>
        </div>
      </Panel>

      {serverError && (
        <p role="alert" className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          {serverError}
        </p>
      )}
    </form>
  )
}

export default ProductEditForm
