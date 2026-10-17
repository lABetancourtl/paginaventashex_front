import { useQuery } from '@tanstack/react-query'
import { getAddresses } from '../services/addressService'
import { addressKeys } from '../queryKeys'
import { useAuth } from '../../auth/hooks/useAuth'
import type { Address } from '../types'

// La principal siempre primero
function sortByPrincipal(addresses: Address[]): Address[] {
  return [...addresses].sort((a, b) => Number(b.esPrincipal) - Number(a.esPrincipal))
}

export function useAddresses() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: addressKeys.all,
    queryFn: getAddresses,
    enabled: isAuthenticated,
    select: sortByPrincipal,
  })
}