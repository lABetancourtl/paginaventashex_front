import { apiGet } from '../../../api/client'
import type { Departamento } from '../types'

export function getDepartamentos(): Promise<Departamento[]> {
  return apiGet<Departamento[]>('/geography/departamentos')
}