import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import FormField from '../../../components/FormField'
import { inputClass, primaryButtonClass, readOnlyInputClass } from '../../../components/formStyles'
import { GENERO_LABELS, GENERO_VALUES } from '../genero'
import { toUpdateRequest, todayAsDateOnly, validateProfileForm } from '../profileForm'
import type { ProfileFormErrors, ProfileFormValues } from '../profileForm'
import type { UpdateProfileRequest } from '../types'

interface ProfileFormProps {
  initialValues: ProfileFormValues
  email: string
  isSaving: boolean
  serverError: string | null
  onSubmit: (request: UpdateProfileRequest) => void
}

const NUMERIC_FIELDS: (keyof ProfileFormValues)[] = ['documento', 'telefono']

function ProfileForm({ initialValues, email, isSaving, serverError, onSubmit }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>(initialValues)
  const [errors, setErrors] = useState<ProfileFormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const isNumeric = NUMERIC_FIELDS.includes(name as keyof ProfileFormValues)
    const cleanValue = isNumeric ? value.replace(/\D/g, '') : value

    const nextValues = { ...values, [name]: cleanValue } as ProfileFormValues
    setValues(nextValues)

    if (submitted) {
      setErrors(validateProfileForm(nextValues))
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)

    const validationErrors = validateProfileForm(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    onSubmit(toUpdateRequest(values))
  }

  const ariaFor = (field: keyof ProfileFormValues) => ({
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
  })

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2"
    >
      <FormField id="nombre" label="Nombre" required error={errors.nombre}>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={values.nombre}
          onChange={handleChange}
          autoComplete="given-name"
          maxLength={100}
          aria-required="true"
          disabled={isSaving}
          className={inputClass}
          {...ariaFor('nombre')}
        />
      </FormField>

      <FormField id="apellido" label="Apellido" required error={errors.apellido}>
        <input
          id="apellido"
          name="apellido"
          type="text"
          value={values.apellido}
          onChange={handleChange}
          autoComplete="family-name"
          maxLength={100}
          aria-required="true"
          disabled={isSaving}
          className={inputClass}
          {...ariaFor('apellido')}
        />
      </FormField>

      <FormField id="email" label="Email" hint="El email no se puede cambiar.">
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          aria-describedby="email-hint"
          className={readOnlyInputClass}
        />
      </FormField>

      <FormField id="documento" label="Cédula de ciudadanía" required error={errors.documento}>
        <input
          id="documento"
          name="documento"
          type="text"
          inputMode="numeric"
          value={values.documento}
          onChange={handleChange}
          maxLength={10}
          aria-required="true"
          disabled={isSaving}
          className={inputClass}
          {...ariaFor('documento')}
        />
      </FormField>

      <FormField id="telefono" label="Teléfono" error={errors.telefono}>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          inputMode="numeric"
          value={values.telefono}
          onChange={handleChange}
          autoComplete="tel-national"
          placeholder="Opcional"
          maxLength={10}
          disabled={isSaving}
          className={inputClass}
          {...ariaFor('telefono')}
        />
      </FormField>

      <FormField id="genero" label="Género">
        <select
          id="genero"
          name="genero"
          value={values.genero}
          onChange={handleChange}
          disabled={isSaving}
          className={inputClass}
        >
          <option value="" disabled hidden>
            Selecciona una opción
          </option>
          {GENERO_VALUES.map((genero) => (
            <option key={genero} value={genero}>
              {GENERO_LABELS[genero]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="fechaNacimiento" label="Fecha de nacimiento" error={errors.fechaNacimiento}>
        <input
          id="fechaNacimiento"
          name="fechaNacimiento"
          type="date"
          value={values.fechaNacimiento}
          onChange={handleChange}
          min="1900-01-01"
          max={todayAsDateOnly()}
          autoComplete="bday"
          disabled={isSaving}
          className={inputClass}
          {...ariaFor('fechaNacimiento')}
        />
      </FormField>

      {/* El botón queda en la columna derecha, alineado abajo como en el diseño */}
      <div className="flex flex-col justify-end gap-3">
        {serverError && (
          <p role="alert" className="text-sm text-danger">
            {serverError}
          </p>
        )}
        <button type="submit" disabled={isSaving} className={primaryButtonClass}>
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

export default ProfileForm