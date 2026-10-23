import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  deleteProductMedia,
  reorderProductMedia,
  uploadProductMedia,
} from '../services/productMediaService'
import type { MediaKind } from '../services/productMediaService'
import { productKeys } from '../queryKeys'
import type { Product } from '../types'

interface UploadVariables {
  productId: number
  kind: MediaKind
  file: File
  onProgress?: (percent: number) => void
}

export function useUploadProductMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, kind, file, onProgress }: UploadVariables) =>
      uploadProductMedia(productId, kind, file, onProgress),
    // Sin return: la siguiente subida no espera a que se recargue el producto
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

interface DeleteVariables {
  productId: number
  mediaId: number
}

export function useDeleteProductMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, mediaId }: DeleteVariables) => deleteProductMedia(productId, mediaId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}

interface ReorderVariables {
  productId: number
  mediaId: number
  newDisplayOrder: number
}

// Mover imágenes, con actualización optimista (intercambio, como en el backend)
export function useReorderProductMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, mediaId, newDisplayOrder }: ReorderVariables) =>
      reorderProductMedia(productId, mediaId, newDisplayOrder),

    onMutate: async ({ productId, mediaId, newDisplayOrder }) => {
      const key = productKeys.adminDetail(productId)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Product>(key)

      queryClient.setQueryData<Product>(key, (old) => {
        if (!old) return old
        const moving = old.media.find((item) => item.id === mediaId)
        if (!moving) return old

        const oldOrder = moving.displayOrder
        return {
          ...old,
          media: old.media.map((item) => {
            if (item.id === mediaId) return { ...item, displayOrder: newDisplayOrder }
            if (item.displayOrder === newDisplayOrder) return { ...item, displayOrder: oldOrder }
            return item
          }),
        }
      })

      return { previous, key }
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous)
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}