import { apiGet } from '../../../api/client'
import type { Color, Size, SizeQuery } from '../types'

export function getSizes(query: SizeQuery = {}): Promise<Size[]> {
  return apiGet<Size[]>('/sizes', query)
}

export function getColors(includeInactive = false): Promise<Color[]> {
  return apiGet<Color[]>('/colors', includeInactive ? { includeInactive: true } : undefined)
}