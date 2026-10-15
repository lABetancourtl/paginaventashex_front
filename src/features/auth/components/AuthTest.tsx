import { useState } from 'react'
import { apiGet } from '../../../api/client'

// TEMPORAL: solo para probar endpoints protegidos
function AuthTest() {
  const [result, setResult] = useState<string>('')

  const probar = async (url: string) => {
    setResult('Cargando...')
    try {
      const data = await apiGet<unknown>(url)
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setResult(`ERROR: ${message}`)
    }
  }

  return (
    <div>
      <h2>Prueba de endpoints protegidos</h2>
      <button type="button" onClick={() => probar('/profile')}>
        GET /profile (Cliente)
      </button>
      <button type="button" onClick={() => probar('/orders/all')}>
        GET /orders/all (Admin)
      </button>
      <pre>{result}</pre>
    </div>
  )
}

export default AuthTest