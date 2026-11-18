import { useQuery } from '@tanstack/react-query'
import { getHomePage } from '../services/homeService'
import { homeKeys } from '../queryKeys'

// Toda la página de inicio de la tienda en una sola llamada
export function useHomePage() {
  return useQuery({
    queryKey: homeKeys.page,
    queryFn: getHomePage,
  })
}
