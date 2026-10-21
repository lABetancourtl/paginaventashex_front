import { apiGet } from '../../../api/client'
import type { Category, CategoryTreeNode } from '../types'

export function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>('/categories')
}

export function getCategoryTree(): Promise<CategoryTreeNode[]> {
  return apiGet<CategoryTreeNode[]>('/categories/tree')
}