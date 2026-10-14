import { useEffect, useState } from 'react'
import { getCategories } from '../services/categoryService'
import type { Category } from '../types'

// Encapsula el estado de la petición de categorías
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  // Lo que el componente necesita saber
  return { categories, isLoading, error }
}