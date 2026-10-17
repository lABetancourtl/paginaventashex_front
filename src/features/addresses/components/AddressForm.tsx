import { useId, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import FormField from '../../../components/FormField'
import { inputClass, primaryButtonClass } from '../../../components/formStyles'
import { useDepartamentos } from '../../geography/hooks/useDepartamentos'
import { useMunicipios } from '../../geography/hooks/useMunicipios'
import { toAddressRequest, validateAddressForm } from '../addressForm'
import type { AddressFormErrors, AddressFormValues } from '../addressForm'
import type { AddressRequest } from '../types'

interface AddressFormProps {
  initialValues: AddressFormValues
  submitLabel: string
  isSaving: boolean
  serverError: string | null
  onSubmit: (request: AddressRequest) => void
}

function AddressForm({ initialValues, submitLabel, isSaving, serverError, onSubmit }: AddressFormProps) {
  const baseId = useId()
  const fieldId = (name: keyof AddressFormValues) => `${baseId}-${name}`

  const [values, setValues] = useState<AddressFormValues>(initialValues)
  const [errors, setErrors] = useState<AddressFormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  // ─── Datos para los selects ───────────────────────────────
  const departamentos = useDepartamentos()
  const departamentoCodigo =
    values.departamentoCodigo === '' ? null : Number(values.departamentoCodigo)
  const municipios = useMunicipios(departamentoCodigo)

  // Los demás campos aparecen cuando ya hay un municipio, como en el diseño
  const showDetails = values.municipioCodigo !== ''

  // ─── Cambios ──────────────────────────────────────────────
  const updateValues = (nextValues: AddressFormValues) => {
    setValues(nextValues)
    if (submitted) {
      setErrors(validateAddressForm(nextValues))
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    updateValues({ ...values, [name]: value } as AddressFormValues)
  }

  // Al cambiar de departamento, el municipio anterior ya no es válido
  const handleDepartamentoChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateValues({ ...values, departamentoCodigo: e.target.value, municipioCodigo: '' })
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)

    const validationErrors = validateAddressForm(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    onSubmit(toAddressRequest(values))
  }

  const ariaFor = (field: keyof AddressFormValues) => ({
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${fieldId(field)}-error` : undefined,
  })

  // ─── Texto del select de municipios según el estado ───────
  let municipioPlaceholder = 'Municipio'
  if (departamentoCodigo === null) municipioPlaceholder = 'Elige primero un departamento'
  else if (municipios.isLoading) municipioPlaceholder = 'Cargando municipios...'

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2"
    >
      <FormField
        id={fieldId('departamentoCodigo')}
        label="Departamento"
        required
        error={errors.departamentoCodigo}
      >
        <select
          id={fieldId('departamentoCodigo')}
          name="departamentoCodigo"
          value={values.departamentoCodigo}
          onChange={handleDepartamentoChange}
          disabled={isSaving || departamentos.isPending}
          aria-required="true"
          className={inputClass}
          {...ariaFor('departamentoCodigo')}
        >
          <option value="" disabled hidden>
            {departamentos.isPending ? 'Cargando departamentos...' : 'Departamento'}
          </option>
          {departamentos.data?.map((dept) => (
            <option key={dept.codigo} value={dept.codigo}>
              {dept.nombre}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        id={fieldId('municipioCodigo')}
        label="Municipio"
        required
        error={errors.municipioCodigo ?? municipios.error?.message}
      >
        <select
          id={fieldId('municipioCodigo')}
          name="municipioCodigo"
          value={values.municipioCodigo}
          onChange={handleChange}
          disabled={isSaving || departamentoCodigo === null || municipios.isLoading}
          aria-required="true"
          className={inputClass}
          {...ariaFor('municipioCodigo')}
        >
          <option value="" disabled hidden>
            {municipioPlaceholder}
          </option>
          {municipios.data?.map((mun) => (
            <option key={mun.codigo} value={mun.codigo}>
              {mun.nombre}
            </option>
          ))}
        </select>
      </FormField>

      {showDetails && (
        <>
          <FormField
            id={fieldId('direccionTexto')}
            label="Dirección"
            required
            error={errors.direccionTexto}
          >
            <input
              id={fieldId('direccionTexto')}
              name="direccionTexto"
              type="text"
              value={values.direccionTexto}
              onChange={handleChange}
              placeholder="Calle 15 # 12-34"
              autoComplete="address-line1"
              maxLength={200}
              aria-required="true"
              disabled={isSaving}
              className={inputClass}
              {...ariaFor('direccionTexto')}
            />
          </FormField>

          <FormField
            id={fieldId('informacionAdicional')}
            label="Información adicional (ej.: Apto. 201)"
          >
            <input
              id={fieldId('informacionAdicional')}
              name="informacionAdicional"
              type="text"
              value={values.informacionAdicional}
              onChange={handleChange}
              placeholder="Opcional"
              autoComplete="address-line2"
              maxLength={100}
              disabled={isSaving}
              className={inputClass}
            />
          </FormField>

          <FormField id={fieldId('barrio')} label="Barrio">
            <input
              id={fieldId('barrio')}
              name="barrio"
              type="text"
              value={values.barrio}
              onChange={handleChange}
              placeholder="Opcional"
              maxLength={100}
              disabled={isSaving}
              className={inputClass}
            />
          </FormField>

          <FormField
            id={fieldId('nombreQuienRecibe')}
            label="Nombre de quien recibe"
            required
            error={errors.nombreQuienRecibe}
          >
            <input
              id={fieldId('nombreQuienRecibe')}
              name="nombreQuienRecibe"
              type="text"
              value={values.nombreQuienRecibe}
              onChange={handleChange}
              autoComplete="name"
              maxLength={100}
              aria-required="true"
              disabled={isSaving}
              className={inputClass}
              {...ariaFor('nombreQuienRecibe')}
            />
          </FormField>
        </>
      )}

      {/* El botón siempre en la columna derecha, como en el diseño */}
      <div className="flex flex-col gap-3 sm:col-start-2">
        {serverError && (
          <p role="alert" className="text-sm text-danger">
            {serverError}
          </p>
        )}
        <button type="submit" disabled={isSaving} className={primaryButtonClass}>
          {isSaving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default AddressForm