import { apiGet } from '../../../api/client'
import type { Municipio } from '../types'

export function getMunicipios(departamentoCodigo: number): Promise<Municipio[]> {
  return apiGet<Municipio[]>(`/geography/departamentos/${departamentoCodigo}/municipios`)
}