import type { Address, AddressRequest } from './types'

// ─── Modelo del formulario: todo es texto ────────────────────
// Los códigos son texto porque así los entrega un <select>
export interface AddressFormValues {
  departamentoCodigo: string
  municipioCodigo: string
  direccionTexto: string
  informacionAdicional: string
  barrio: string
  nombreQuienRecibe: string
}

export type AddressFormErrors = Partial<Record<keyof AddressFormValues, string>>

// ─── Valores iniciales ───────────────────────────────────────
export function emptyAddressFormValues(defaultNombre = ''): AddressFormValues {
  return {
    departamentoCodigo: '',
    municipioCodigo: '',
    direccionTexto: '',
    informacionAdicional: '',
    barrio: '',
    nombreQuienRecibe: defaultNombre,
  }
}

export function toAddressFormValues(address: Address): AddressFormValues {
  return {
    departamentoCodigo: String(address.departamentoCodigo),
    municipioCodigo: String(address.municipioCodigo),
    direccionTexto: address.direccionTexto,
    informacionAdicional: address.informacionAdicional ?? '',
    barrio: address.barrio ?? '',
    nombreQuienRecibe: address.nombreQuienRecibe,
  }
}

// ─── Formulario → API ────────────────────────────────────────
function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function toAddressRequest(values: AddressFormValues): AddressRequest {
  return {
    departamentoCodigo: Number(values.departamentoCodigo),
    municipioCodigo: Number(values.municipioCodigo),
    direccionTexto: values.direccionTexto.trim(),
    informacionAdicional: emptyToNull(values.informacionAdicional),
    barrio: emptyToNull(values.barrio),
    nombreQuienRecibe: values.nombreQuienRecibe.trim(),
  }
}

// ─── Validación ──────────────────────────────────────────────
// Las longitudes máximas las controla el atributo maxLength de cada input
export function validateAddressForm(values: AddressFormValues): AddressFormErrors {
  const errors: AddressFormErrors = {}

  if (values.departamentoCodigo === '') {
    errors.departamentoCodigo = 'Selecciona un departamento.'
  }
  if (values.municipioCodigo === '') {
    errors.municipioCodigo = 'Selecciona un municipio.'
  }
  if (values.direccionTexto.trim() === '') {
    errors.direccionTexto = 'Escribe la dirección.'
  }
  if (values.nombreQuienRecibe.trim() === '') {
    errors.nombreQuienRecibe = 'Escribe el nombre de quien recibe.'
  }

  return errors
}