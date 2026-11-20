import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient, QueryKey } from '@tanstack/react-query'
import {
  activateHomeSection,
  createHomeSection,
  deactivateHomeSection,
  deleteHomeItem,
  deleteHomeSection,
  getHomeItems,
  getHomeProducts,
  getHomeSections,
  removeHomeItemMobile,
  reorderHomeItem,
  reorderHomeSection,
  setHomeItemMobile,
  setHomeProducts,
  updateHomeItemLink,
  updateHomeSection,
  uploadHomeItem,
} from '../services/homeService'
import { homeKeys } from '../queryKeys'
import type { UpdateHomeSectionRequest } from '../types'

const byOrder = <T extends { displayOrder: number }>(list: T[]) =>
  [...list].sort((a, b) => a.displayOrder - b.displayOrder)

// Cualquier cambio del admin invalida también la página pública (homeKeys.all)
const invalidateHome = (queryClient: QueryClient) => queryClient.invalidateQueries({ queryKey: homeKeys.all })

// Intercambio de órdenes, como hace el backend
function swapOrder<T extends { displayOrder: number }>(list: T[], isMoving: (item: T) => boolean, newOrder: number) {
  const moving = list.find(isMoving)
  if (!moving) return list
  const oldOrder = moving.displayOrder
  return list.map((item) => {
    if (isMoving(item)) return { ...item, displayOrder: newOrder }
    if (item.displayOrder === newOrder) return { ...item, displayOrder: oldOrder }
    return item
  })
}

// Actualización optimista de una lista; devuelve el contexto para revertir
async function optimistic<T>(queryClient: QueryClient, key: QueryKey, update: (old: T) => T) {
  await queryClient.cancelQueries({ queryKey: key })
  const previous = queryClient.getQueryData<T>(key)
  if (previous !== undefined) queryClient.setQueryData<T>(key, update(previous))
  return { previous, key }
}

// ─── Consultas ───────────────────────────────────────────────
export function useHomeSections() {
  return useQuery({
    queryKey: homeKeys.sections,
    queryFn: getHomeSections,
    select: byOrder,
  })
}

// Al abrir la pantalla siempre se recargan: un producto pudo dejar de verse
export function useHomeItems(sectionId: number, enabled = true) {
  return useQuery({
    queryKey: homeKeys.items(sectionId),
    queryFn: () => getHomeItems(sectionId),
    select: byOrder,
    enabled,
    refetchOnMount: 'always',
  })
}

export function useHomeProducts(sectionId: number, enabled = true) {
  return useQuery({
    queryKey: homeKeys.products(sectionId),
    queryFn: () => getHomeProducts(sectionId),
    select: byOrder,
    enabled,
    refetchOnMount: 'always',
  })
}

// ─── Secciones ───────────────────────────────────────────────
export function useCreateHomeSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createHomeSection,
    onSuccess: () => invalidateHome(queryClient),
  })
}

export function useUpdateHomeSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateHomeSectionRequest }) =>
      updateHomeSection(id, request),
    onSuccess: () => invalidateHome(queryClient),
  })
}

export function useSetHomeSectionStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      active ? activateHomeSection(id) : deactivateHomeSection(id),
    onSuccess: () => invalidateHome(queryClient),
  })
}

export function useReorderHomeSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newDisplayOrder }: { id: number; newDisplayOrder: number }) =>
      reorderHomeSection(id, newDisplayOrder),
    onMutate: ({ id, newDisplayOrder }) =>
      optimistic<Awaited<ReturnType<typeof getHomeSections>>>(queryClient, homeKeys.sections, (old) =>
        swapOrder(old, (section) => section.id === id, newDisplayOrder),
      ),
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous)
    },
    onSettled: () => invalidateHome(queryClient),
  })
}

export function useDeleteHomeSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteHomeSection,
    onSuccess: () => invalidateHome(queryClient),
  })
}

// ─── Medios de un banner ─────────────────────────────────────
interface UploadVariables {
  file: File
  categoryId: number | null
  onProgress?: (percent: number) => void
}

export function useUploadHomeItem(sectionId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, categoryId, onProgress }: UploadVariables) =>
      uploadHomeItem(sectionId, file, categoryId, onProgress),
    onSuccess: () => invalidateHome(queryClient),
  })
}

export function useUpdateHomeItemLink(sectionId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, categoryId }: { itemId: number; categoryId: number | null }) =>
      updateHomeItemLink(sectionId, itemId, categoryId),
    onSuccess: () => invalidateHome(queryClient),
  })
}

export function useReorderHomeItem(sectionId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, newDisplayOrder }: { itemId: number; newDisplayOrder: number }) =>
      reorderHomeItem(sectionId, itemId, newDisplayOrder),
    onMutate: ({ itemId, newDisplayOrder }) =>
      optimistic<Awaited<ReturnType<typeof getHomeItems>>>(queryClient, homeKeys.items(sectionId), (old) =>
        swapOrder(old, (item) => item.id === itemId, newDisplayOrder),
      ),
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous)
    },
    onSettled: () => invalidateHome(queryClient),
  })
}

export function useDeleteHomeItem(sectionId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: number) => deleteHomeItem(sectionId, itemId),
    onSuccess: () => invalidateHome(queryClient),
  })
}

export function useSetHomeItemMobile(sectionId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, file, onProgress }: { itemId: number; file: File; onProgress?: (percent: number) => void }) =>
      setHomeItemMobile(sectionId, itemId, file, onProgress),
    onSuccess: () => invalidateHome(queryClient),
  })
}

export function useRemoveHomeItemMobile(sectionId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: number) => removeHomeItemMobile(sectionId, itemId),
    onSuccess: () => invalidateHome(queryClient),
  })
}

// ─── Productos de un estante ─────────────────────────────────
export function useSetHomeProducts(sectionId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (productIds: number[]) => setHomeProducts(sectionId, productIds),
    onSuccess: () => invalidateHome(queryClient),
  })
}
