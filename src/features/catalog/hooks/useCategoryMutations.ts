import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  activateCategory,
  createCategory,
  deactivateCategory,
  reorderCategory,
  updateCategory,
} from '../services/categoryService'
import { categoryKeys } from '../queryKeys'
import { swapDisplayOrder } from '../categoryTree'
import type { AdminCategoryNode, UpdateCategoryRequest } from '../types'

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

interface UpdateCategoryVariables {
  id: number
  request: UpdateCategoryRequest
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: UpdateCategoryVariables) => updateCategory(id, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

interface SetCategoryStatusVariables {
  id: number
  active: boolean
}

export function useSetCategoryStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: SetCategoryStatusVariables) =>
      active ? activateCategory(id) : deactivateCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

interface ReorderCategoryVariables {
  id: number
  newDisplayOrder: number
}

// Subir y bajar, con actualización optimista
export function useReorderCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newDisplayOrder }: ReorderCategoryVariables) =>
      reorderCategory(id, newDisplayOrder),

    onMutate: async ({ id, newDisplayOrder }) => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.adminTree })
      const previous = queryClient.getQueryData<AdminCategoryNode[]>(categoryKeys.adminTree)

      queryClient.setQueryData<AdminCategoryNode[]>(categoryKeys.adminTree, (old) =>
        old ? swapDisplayOrder(old, id, newDisplayOrder) : old,
      )

      return { previous }
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(categoryKeys.adminTree, context.previous)
      }
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}