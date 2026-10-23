import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { inputClass } from '../../components/formStyles'
import { formatCOP } from '../../utils/formatters'
import { adminPrimaryButtonClass, adminSecondaryButtonClass } from '../adminStyles'

interface ProductDiscountFormProps {
  price: number
  currentPercent: number | null
  isSaving: boolean
  isRemoving: boolean
  serverError: string | null
  onApply: (percent: number) => void
  onRemove: () => void
}

function ProductDiscountForm({
  price,
  currentPercent,
  isSaving,
  isRemoving,
  serverError,
  onApply,
  onRemove,
}: ProductDiscountFormProps) {
  const inputId = useId()
  const [percent, setPercent] = useState(currentPercent ? String(currentPercent) : '')
  const [error, setError] = useState<string | null>(null)

  const value = Number(percent)
  const isValid = Number.isInteger(value) && value >= 1 && value <= 99
  // Vista previa: el backend redondea a pesos enteros
  const previewPrice = isValid ? Math.round(price * (1 - value / 100)) : null
  const isBusy = isSaving || isRemoving

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) {
      setError('Escribe un porcentaje entre 1 y 99.')
      return
    }
    setError(null)
    onApply(value)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div>
        <label htmlFor={inputId} className="mb-2 block text-xs font-bold uppercase tracking-wide">
          Porcentaje de descuento
        </label>
        <div className="flex items-center gap-2">
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            value={percent}
            onChange={(e) => {
              setPercent(e.target.value.replace(/\D/g, '').slice(0, 2))
              setError(null)
            }}
            placeholder="15"
            disabled={isBusy}
            aria-invalid={error ? true : undefined}
            className={`${inputClass} w-24 rounded-lg`}
          />
          <span className="text-sm text-ink-muted">%</span>
        </div>
      </div>

      {previewPrice !== null && (
        <p className="text-sm">
          <span className="text-ink-muted line-through">{formatCOP(price)}</span>{' '}
          <span className="font-semibold text-sale-ink">{formatCOP(previewPrice)}</span>
        </p>
      )}

      {(error || serverError) && (
        <p role="alert" className="text-sm text-danger">
          {error ?? serverError}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={isBusy} className={adminPrimaryButtonClass}>
          {isSaving ? 'Guardando...' : currentPercent ? 'Cambiar descuento' : 'Aplicar descuento'}
        </button>
        {currentPercent !== null && (
          <button type="button" onClick={onRemove} disabled={isBusy} className={adminSecondaryButtonClass}>
            {isRemoving ? 'Quitando...' : 'Quitar descuento'}
          </button>
        )}
      </div>
    </form>
  )
}

export default ProductDiscountForm