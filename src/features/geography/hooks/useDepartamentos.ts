import { useEffect, useState } from 'react'
import { getDepartamentos } from '../services/departamentoService'
import type { Departamento } from '../types'

export function useDepartamentos() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDepartamentos()
        setDepartamentos(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  return { departamentos, isLoading, error }
}