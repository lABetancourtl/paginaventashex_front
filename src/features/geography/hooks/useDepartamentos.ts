import { useQuery } from '@tanstack/react-query'
import { getDepartamentos } from '../services/departamentoService'
import { geographyKeys } from '../queryKeys'

export function useDepartamentos() {
  return useQuery({
    queryKey: geographyKeys.departamentos,
    queryFn: getDepartamentos,
    staleTime: Infinity, // Los departamentos no cambian
  })
}