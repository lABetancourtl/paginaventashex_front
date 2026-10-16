import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import FormField from '../../../components/FormField'
import { GENERO_LABELS, GENERO_VALUES } from '../genero'
import {
  toUpdateRequest,
  todayAsDateOnly,
  validateProfileForm,
} from '../profileForm'
import type { ProfileFormErrors, ProfileFormValues } from '../profileForm'
import type { UpdateProfileRequest } from '../types'

interface ProfileFormProps {
  initialValues: ProfileFormValues
  email: string
  isSaving: boolean
  serverError: string | null
  onSubmit: (request: UpdateProfileRequest) => void
}
// Campos que solo aceptan dígitos
const NUMERIC_FIELDS: (keyof ProfileFormValues)[] = ['documento', 'telefono']

function ProfileForm({ initialValues, email, isSaving, serverError, onSubmit }: ProfileFormProps) {
  // Un solo estado con todos los campos
  const [values, setValues] = useState<ProfileFormValues>(initialValues)
  const [errors, setErrors] = useState<ProfileFormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  // Un solo manejador para todos los campos, gracias al atributo "name"
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // En los campos numéricos, eliminamos todo lo que no sea dígito
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

    // Si hay al menos un error, no se envía
    if (Object.keys(validationErrors).length > 0) return

    onSubmit(toUpdateRequest(values))
  }

  // Atributos de accesibilidad para un campo según su error
  const ariaFor = (field: keyof ProfileFormValues) => ({
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
  })

  return (
    <form onSubmit={handleSubmit} noValidate>
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
        >
          <option value="">Opcional</option>
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
          {...ariaFor('fechaNacimiento')}
        />
      </FormField>

      {serverError && <p role="alert">{serverError}</p>}

      <button type="submit" disabled={isSaving}>
        {isSaving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

export default ProfileForm