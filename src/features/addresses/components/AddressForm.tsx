import { useId, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import FormField from '../../../components/FormField'
import SearchableSelect from '../../../components/SearchableSelect'
import { inputClass, primaryButtonClass } from '../../../components/formStyles'
import { useDepartamentos } from '../../geography/hooks/useDepartamentos'
import { useMunicipios } from '../../geography/hooks/useMunicipios'
import { toAddressRequest, validateAddressForm } from '../addressForm'
import type { AddressFormErrors, AddressFormValues } from '../addressForm'
import type { Departamento, Municipio } from '../../geography/types'
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

  // ─── Datos para los selectores ────────────────────────────
  const departamentos = useDepartamentos()
  const departamentoCodigo =
    values.departamentoCodigo === '' ? null : Number(values.departamentoCodigo)
  const municipios = useMunicipios(departamentoCodigo)

  // El formulario guarda códigos; los selectores necesitan los objetos completos
  const selectedDepartamento =
    departamentos.data?.find((dept) => String(dept.codigo) === values.departamentoCodigo) ?? null
  const selectedMunicipio =
    municipios.data?.find((mun) => String(mun.codigo) === values.municipioCodigo) ?? null

  const showDetails = values.municipioCodigo !== ''

  // ─── Cambios ──────────────────────────────────────────────
  const updateValues = (nextValues: AddressFormValues) => {
    setValues(nextValues)
    if (submitted) {
      setErrors(validateAddressForm(nextValues))
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    updateValues({ ...values, [name]: value } as AddressFormValues)
  }

  const handleDepartamentoChange = (dept: Departamento | null) => {
    const nextCodigo = dept ? String(dept.codigo) : ''

    // Si eligió el mismo departamento, no reiniciamos el municipio
    if (nextCodigo === values.departamentoCodigo) return

    updateValues({ ...values, departamentoCodigo: nextCodigo, municipioCodigo: '' })
  }

  const handleMunicipioChange = (mun: Municipio | null) => {
    updateValues({ ...values, municipioCodigo: mun ? String(mun.codigo) : '' })
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

  // ─── Textos de ayuda de los selectores ────────────────────
  const departamentoPlaceholder = departamentos.isPending
    ? 'Cargando departamentos...'
    : 'Busca tu departamento'

  let municipioPlaceholder = 'Busca tu municipio'
  if (departamentoCodigo === null) municipioPlaceholder = 'Elige primero un departamento'
  else if (municipios.isLoading) municipioPlaceholder = 'Cargando municipios...'

  const municipioError = errors.municipioCodigo ?? municipios.error?.message

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
        <SearchableSelect
          id={fieldId('departamentoCodigo')}
          options={departamentos.data ?? []}
          value={selectedDepartamento}
          onChange={handleDepartamentoChange}
          getLabel={(dept) => dept.nombre}
          getKey={(dept) => dept.codigo}
          placeholder={departamentoPlaceholder}
          emptyText="No encontramos ese departamento"
          disabled={isSaving || departamentos.isPending}
          invalid={Boolean(errors.departamentoCodigo)}
          describedBy={
            errors.departamentoCodigo ? `${fieldId('departamentoCodigo')}-error` : undefined
          }
        />
      </FormField>

      <FormField
        id={fieldId('municipioCodigo')}
        label="Municipio"
        required
        error={municipioError}
      >
        <SearchableSelect
          id={fieldId('municipioCodigo')}
          options={municipios.data ?? []}
          value={selectedMunicipio}
          onChange={handleMunicipioChange}
          getLabel={(mun) => mun.nombre}
          getKey={(mun) => mun.codigo}
          placeholder={municipioPlaceholder}
          emptyText="No encontramos ese municipio"
          disabled={isSaving || departamentoCodigo === null || municipios.isLoading}
          invalid={Boolean(municipioError)}
          describedBy={municipioError ? `${fieldId('municipioCodigo')}-error` : undefined}
        />
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