// Formato del error que retorna el backend
export interface ApiError {
  code: string
  message: string
}

// Envoltorio estándar de todas las respuestas del backend
// T es el tipo de "data", y cambia según el endpoint
export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  data: T | null
  error: ApiError | null
}

// Respuesta paginada genérica del backend
export interface PagedResult<T> {
  items: T[]
  totalItems: number
  page: number
  totalPages: number
}