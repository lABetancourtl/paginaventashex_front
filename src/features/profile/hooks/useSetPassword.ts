import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setPassword } from '../services/profileService'
import { profileKeys } from '../queryKeys'

export function useSetPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setPassword,
    // tienePassword cambia, así que el perfil en caché queda desactualizado
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.all }),
  })
}