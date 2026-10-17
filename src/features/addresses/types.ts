// Dirección tal como la retorna GET /api/profile/addresses
export interface Address {
  id: number
  departamentoCodigo: number
  departamentoNombre: string
  municipioCodigo: number
  municipioNombre: string
  direccionTexto: string
  informacionAdicional: string | null
  barrio: string | null
  nombreQuienRecibe: string
  esPrincipal: boolean
}

// Body de POST y PUT /api/profile/addresses
export interface AddressRequest {
  departamentoCodigo: number
  municipioCodigo: number
  direccionTexto: string
  informacionAdicional: string | null
  barrio: string | null
  nombreQuienRecibe: string
}