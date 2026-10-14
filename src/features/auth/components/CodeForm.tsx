import { useState } from 'react'
import type { FormEvent } from 'react'

const CODE_LENGTH = 6

interface CodeFormProps {
  email: string
  isLoading: boolean
  error: string | null
  onSubmit: (code: string) => void
  onResend: () => void
  onChangeEmail: () => void
}

function CodeForm({
  email,
  isLoading,
  error,
  onSubmit,
  onResend,
  onChangeEmail,
}: CodeFormProps) {
  const [code, setCode] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(code)
  }

  // Solo permite dígitos y máximo 6 caracteres
  const handleChange = (value: string) => {
    const onlyDigits = value.replace(/\D/g, '').slice(0, CODE_LENGTH)
    setCode(onlyDigits)
  }

  const isComplete = code.length === CODE_LENGTH

  return (
    <form onSubmit={handleSubmit}>
      <h2>Ingresa el código</h2>
      <p>Enviamos un código de {CODE_LENGTH} dígitos a <strong>{email}</strong></p>

      <label htmlFor="code">Código de verificación</label>
      <input
        id="code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="000000"
        disabled={isLoading}
        autoFocus
      />

      {error && <p>{error}</p>}

      <button type="submit" disabled={isLoading || !isComplete}>
        {isLoading ? 'Verificando...' : 'Verificar'}
      </button>

      <button type="button" onClick={onResend} disabled={isLoading}>
        Reenviar código
      </button>

      <button type="button" onClick={onChangeEmail} disabled={isLoading}>
        Cambiar correo
      </button>
    </form>
  )
}

export default CodeForm