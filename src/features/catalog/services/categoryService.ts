import { apiGet } from '../../../api/client'
import type { Category } from '../types'

export function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>('/categories')
}