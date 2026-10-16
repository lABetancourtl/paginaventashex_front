import { useState } from 'react'
import { updateProfile } from '../services/profileService'
import type { UpdateProfileRequest } from '../types'

export function useUpdateProfile() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Retorna true si se guardó correctamente
  const save = async (request: UpdateProfileRequest): Promise<boolean> => {
    setIsSaving(true)
    setError(null)

    try {
      await updateProfile(request)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return { save, isSaving, error }
}