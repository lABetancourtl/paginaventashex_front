import { QueryClient } from '@tanstack/react-query'
import { ApiRequestError } from './client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Durante 30 segundos, el dato se considera fresco y no se vuelve a pedir
      staleTime: 30 * 1000,

      // Reintentar solo errores del servidor o de red, nunca errores 4xx
      retry: (failureCount, error) => {
        const isClientError =
          error instanceof ApiRequestError &&
          error.status !== null &&
          error.status < 500
        if (isClientError) return false
        return failureCount < 2
      },
    },
  },
})