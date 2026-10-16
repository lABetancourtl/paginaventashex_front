import type { Genero, Profile, UpdateProfileRequest } from './types'

// ─── Modelo del formulario: todo es texto ────────────────────
export interface ProfileFormValues {
  nombre: string
  apellido: string
  documento: string
  genero: Genero | '' // '' significa "sin seleccionar"
  fechaNacimiento: string
  telefono: string
}

// Un mensaje de error opcional por cada campo
export type ProfileFormErrors = Partial<Record<keyof ProfileFormValues, string>>

// ─── Fecha de hoy en formato YYYY-MM-DD (hora local) ─────────
export function todayAsDateOnly(): string {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${month}-${day}`
}

// ─── API → formulario ────────────────────────────────────────
export function toFormValues(profile: Profile): ProfileFormValues {
  return {
    nombre: profile.nombre ?? '',
    apellido: profile.apellido ?? '',
    documento: profile.documento ?? '',
    genero: profile.genero ?? '',
    fechaNacimiento: profile.fechaNacimiento ?? '',
    telefono: profile.telefono ?? '',
  }
}

// ─── Formulario → API ────────────────────────────────────────
function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function toUpdateRequest(values: ProfileFormValues): UpdateProfileRequest {
  return {
    nombre: emptyToNull(values.nombre),
    apellido: emptyToNull(values.apellido),
    documento: emptyToNull(values.documento),
    genero: values.genero === '' ? null : values.genero,
    fechaNacimiento: emptyToNull(values.fechaNacimiento),
    telefono: emptyToNull(values.telefono),
  }
}

// ─── Validación ──────────────────────────────────────────────
const ONLY_DIGITS = /^\d+$/

export function validateProfileForm(values: ProfileFormValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {}

  if (values.nombre.trim() === '') {
    errors.nombre = 'El nombre es obligatorio.'
  }

  if (values.apellido.trim() === '') {
    errors.apellido = 'El apellido es obligatorio.'
  }

  const documento = values.documento.trim()
  if (documento === '') {
    errors.documento = 'La cédula es obligatoria.'
  } else if (!ONLY_DIGITS.test(documento)) {
    errors.documento = 'La cédula solo debe contener números.'
  } else if (documento.length < 6 || documento.length > 10) {
    errors.documento = 'La cédula debe tener entre 6 y 10 dígitos.'
  }

  const telefono = values.telefono.trim()
  if (telefono !== '' && !/^\d{10}$/.test(telefono)) {
    errors.telefono = 'El teléfono debe tener 10 dígitos.'
  }

  if (values.fechaNacimiento !== '' && values.fechaNacimiento > todayAsDateOnly()) {
    errors.fechaNacimiento = 'La fecha de nacimiento no puede ser futura.'
  }

  return errors
}