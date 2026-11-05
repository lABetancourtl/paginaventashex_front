import { useQuery } from '@tanstack/react-query'
import { getColors, getSizes } from '../services/attributeService'
import { colorKeys, sizeKeys } from '../queryKeys'
import type { SizeQuery } from '../types'

const FIVE_MINUTES = 5 * 60 * 1000

export function useSizes(query: SizeQuery, enabled = true) {
  return useQuery({
    queryKey: sizeKeys.list(query),
    queryFn: () => getSizes(query),
    staleTime: FIVE_MINUTES,
    enabled,
  })
}

export function useColors(includeInactive = false, enabled = true) {
  return useQuery({
    queryKey: colorKeys.list(includeInactive),
    queryFn: () => getColors(includeInactive),
    staleTime: FIVE_MINUTES,
    enabled,
  })
}