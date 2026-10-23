import { apiGet, apiPatch, apiPost, apiPut } from '../../../api/client'
import type {
  AdminCategoryNode,
  Category,
  CategoryTreeNode,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types'

// ─── Tienda ──────────────────────────────────────────────────
export function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>('/categories')
}

export function getCategoryTree(): Promise<CategoryTreeNode[]> {
  return apiGet<CategoryTreeNode[]>('/categories/tree')
}

// ─── Panel admin ─────────────────────────────────────────────
export function getAdminCategoryTree(): Promise<AdminCategoryNode[]> {
  return apiGet<AdminCategoryNode[]>('/categories/admin/tree')
}

export function createCategory(request: CreateCategoryRequest): Promise<number> {
  return apiPost<number>('/categories', request)
}

export async function updateCategory(id: number, request: UpdateCategoryRequest): Promise<void> {
  await apiPut<number>(`/categories/${id}`, request)
}

export async function activateCategory(id: number): Promise<void> {
  await apiPatch<boolean>(`/categories/${id}/activate`)
}

export async function deactivateCategory(id: number): Promise<void> {
  await apiPatch<boolean>(`/categories/${id}/deactivate`)
}

export async function reorderCategory(id: number, newDisplayOrder: number): Promise<void> {
  await apiPatch<boolean>(`/categories/${id}/reorder`, { newDisplayOrder })
}