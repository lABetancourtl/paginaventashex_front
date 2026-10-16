import { useQuery } from '@tanstack/react-query'
import { getProfile } from '../services/profileService'
import { profileKeys } from '../queryKeys'
import { useAuth } from '../../auth/hooks/useAuth'

export function useProfile() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: profileKeys.all,
    queryFn: getProfile,
    enabled: isAuthenticated, // Sin sesión, no se hace la petición
  })
}