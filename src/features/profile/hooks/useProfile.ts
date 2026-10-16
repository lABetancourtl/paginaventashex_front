import { useEffect, useState } from 'react'
import { getProfile } from '../services/profileService'
import type { Profile } from '../types'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile()
        setProfile(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  return { profile, isLoading, error }
}