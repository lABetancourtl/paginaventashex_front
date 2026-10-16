import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfile } from '../services/profileService'
import { profileKeys } from '../queryKeys'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    // Al guardar, el perfil en caché queda desactualizado: se vuelve a pedir
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.all }),
  })
}