import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { formatCOP } from '../../utils/formatters'
import AdminField, { AdminInputGroup } from './AdminField'
import { adminInputClass, adminPrimaryButtonClass, adminSecondaryButtonClass } from '../adminStyles'

const PRESETS = [10, 15, 20, 30, 50]

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
  const isUnchanged = currentPercent !== null && value === currentPercent

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) {
      setError('Escribe un porcentaje entre 1 y 99.')
      return
    }
    setError(null)
    onApply(value)
  }

  const choosePreset = (preset: number) => {
    setPercent(String(preset))
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {currentPercent !== null && (
        <p className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Descuento activo
          <span className="font-semibold tabular-nums">-{currentPercent}%</span>
        </p>
      )}

      <AdminField id={inputId} label="Porcentaje de descuento" error={error ?? undefined}>
        <AdminInputGroup suffix="%">
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
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`${adminInputClass} pr-8 tabular-nums`}
          />
        </AdminInputGroup>
      </AdminField>

      {/* Atajos */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Porcentajes frecuentes">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => choosePreset(preset)}
            disabled={isBusy}
            aria-pressed={value === preset}
            className="rounded-md border border-admin-line px-2.5 py-1 text-xs font-medium tabular-nums text-ink-muted transition-colors hover:bg-admin-bg hover:text-ink aria-pressed:border-admin-accent/40 aria-pressed:bg-admin-accent/10 aria-pressed:text-admin-accent"
          >
            {preset}%
          </button>
        ))}
      </div>

      {/* Vista previa del precio */}
      <div className="rounded-xl bg-admin-bg px-3 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">Precio con descuento</p>
        {previewPrice !== null ? (
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 tabular-nums">
            <span className="text-lg font-semibold text-sale-ink">{formatCOP(previewPrice)}</span>
            <span className="text-sm text-ink-muted line-through">{formatCOP(price)}</span>
            <span className="text-xs text-ink-muted">Ahorra {formatCOP(price - previewPrice)}</span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-ink-muted">{formatCOP(price)} (sin descuento)</p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-danger">
          {serverError}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <button type="submit" disabled={isBusy || isUnchanged} className={`${adminPrimaryButtonClass} w-full`}>
          {isSaving ? 'Guardando...' : currentPercent ? 'Cambiar descuento' : 'Aplicar descuento'}
        </button>
        {currentPercent !== null && (
          <button type="button" onClick={onRemove} disabled={isBusy} className={`${adminSecondaryButtonClass} w-full`}>
            {isRemoving ? 'Quitando...' : 'Quitar descuento'}
          </button>
        )}
      </div>
    </form>
  )
}

export default ProductDiscountForm
