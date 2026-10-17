import { skipToken, useQuery } from '@tanstack/react-query'
import { getMunicipios } from '../services/municipioService'
import { geographyKeys } from '../queryKeys'

// Recibe null mientras no se haya elegido un departamento
export function useMunicipios(departamentoCodigo: number | null) {
  return useQuery({
    queryKey: geographyKeys.municipios(departamentoCodigo ?? 0),
    queryFn:
      departamentoCodigo === null
        ? skipToken
        : () => getMunicipios(departamentoCodigo),
    staleTime: Infinity, // Los municipios no cambian
  })
}