import axios from 'axios'
import type { ApiResponse } from '../types/api'
import { loadSession } from '../features/auth/services/authStorage' // NUEVO

// ─── Error propio de la aplicación ───────────────────────────
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

// ─── NUEVO: puerto para reaccionar a un 401 ──────────────────
// El cliente no sabe qué hacer ante un 401; quien lo registre decide.
let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

// ─── Traducir cualquier error de Axios a ApiRequestError ─────
function toApiRequestError(error: unknown): ApiRequestError {
  if (!axios.isAxiosError(error)) {
    return new ApiRequestError('Error inesperado', 'UNKNOWN', null)
  }

  if (!error.response) {
    return new ApiRequestError(
      'No se pudo conectar con el servidor. Revisa tu conexión.',
      'NETWORK_ERROR',
      null,
    )
  }

  const status = error.response.status
  const body = error.response.data as ApiResponse<unknown> | undefined

  if (body?.error) {
    return new ApiRequestError(body.error.message, body.error.code, status)
  }

  if (status === 401) {
    return new ApiRequestError('Debes iniciar sesión para continuar.', 'UNAUTHORIZED', status)
  }
  if (status === 403) {
    return new ApiRequestError('No tienes permiso para realizar esta acción.', 'FORBIDDEN', status)
  }
  if (status === 404) {
    return new ApiRequestError('El recurso solicitado no existe.', 'NOT_FOUND', status)
  }
    if (status === 429) {
    return new ApiRequestError(
      'Demasiados intentos. Espera un momento antes de volver a intentar.',
      'TOO_MANY_REQUESTS',
      status,
    )
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

// ─── NUEVO: interceptor de request ───────────────────────────
// Se ejecuta ANTES de cada petición y agrega el token si existe
http.interceptors.request.use((config) => {
  const session = loadSession()

  if (session) {
    config.headers.Authorization = `Bearer ${session.token}`
  }

  return config
})

// ─── Interceptor de respuesta (MODIFICADO) ───────────────────
// ─── Interceptor de respuesta ────────────────────────────────
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiRequestError(error)

    // ¿La petición llevaba token? Solo en ese caso el 401 significa
    // "tu sesión ya no es válida". Sin token, es un error de credenciales.
    const sentToken =
      axios.isAxiosError(error) && Boolean(error.config?.headers?.Authorization)

    if (apiError.status === 401 && sentToken) {
      onUnauthorized?.()
    }

    return Promise.reject(apiError)
  },
)

// ─── Desenvolver el ApiResponse<T> ───────────────────────────
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
export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await http.post<ApiResponse<T>>(url, data)
  return unwrap(response.data)
}

// ─── Helper para peticiones PUT ──────────────────────────────
export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const response = await http.put<ApiResponse<T>>(url, data)
  return unwrap(response.data)
}

// ─── Helper para peticiones PATCH ────────────────────────────
export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const response = await http.patch<ApiResponse<T>>(url, data)
  return unwrap(response.data)
}

// ─── Helper para peticiones DELETE ───────────────────────────
export async function apiDelete<T>(url: string): Promise<T> {
  const response = await http.delete<ApiResponse<T>>(url)
  return unwrap(response.data)
}