import axios from 'axios'
import type { ApiResponse } from '../types/api'

// ─── Error propio de la aplicación ───────────────────────────
// Todos los errores HTTP se convierten a este tipo,
// para que los hooks siempre reciban lo mismo.
export class ApiRequestError extends Error {
  code: string
  status: number | null

  constructor(message: string, code: string, status: number | null) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
    this.status = status
  }
}

// ─── Instancia única de Axios ────────────────────────────────
export const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Traducir cualquier error de Axios a ApiRequestError ─────
function toApiRequestError(error: unknown): ApiRequestError {
  if (!axios.isAxiosError(error)) {
    return new ApiRequestError('Error inesperado', 'UNKNOWN', null)
  }

  // Caso 1: no hubo respuesta (sin internet o timeout)
  if (!error.response) {
    return new ApiRequestError(
      'No se pudo conectar con el servidor. Revisa tu conexión.',
      'NETWORK_ERROR',
      null,
    )
  }

  const status = error.response.status
  const body = error.response.data as ApiResponse<unknown> | undefined

  // Caso 2: el backend respondió con tu formato estándar de error
  if (body?.error) {
    return new ApiRequestError(body.error.message, body.error.code, status)
  }

  // Caso 3: respondió sin cuerpo (como tu 401 de antes)
  if (status === 401) {
    return new ApiRequestError('Debes iniciar sesión para continuar.', 'UNAUTHORIZED', status)
  }
  if (status === 403) {
    return new ApiRequestError('No tienes permiso para realizar esta acción.', 'FORBIDDEN', status)
  }
  if (status === 404) {
    return new ApiRequestError('El recurso solicitado no existe.', 'NOT_FOUND', status)
  }
  if (status >= 500) {
    return new ApiRequestError(
      'El servidor no está disponible. Intenta más tarde.',
      'SERVER_ERROR',
      status,
    )
  }

  return new ApiRequestError('Ocurrió un error inesperado.', 'UNKNOWN', status)
}

// ─── Interceptor de respuesta ────────────────────────────────
// Si la respuesta es 2xx, pasa sin cambios.
// Si es un error, lo convierte antes de que llegue al servicio.
http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiRequestError(error)),
)

// ─── Desenvolver el ApiResponse<T> ───────────────────────────
// Lógica común a todos los helpers: revisar success y sacar data.
function unwrap<T>(body: ApiResponse<T>): T {
  if (!body.success) {
    throw new ApiRequestError(
      body.error?.message ?? 'Error en la respuesta del servidor',
      body.error?.code ?? 'UNKNOWN',
      body.statusCode,
    )
  }

  return body.data as T
}

// ─── Helper para peticiones GET ──────────────────────────────
export async function apiGet<T>(url: string, params?: object): Promise<T> {
  const response = await http.get<ApiResponse<T>>(url, { params })
  return unwrap(response.data)
}

// ─── Helper para peticiones POST ─────────────────────────────
// "data" es el cuerpo que se envía (lo que en .NET recibe [FromBody])
export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await http.post<ApiResponse<T>>(url, data)
  return unwrap(response.data)
}