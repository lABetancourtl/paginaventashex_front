import { useState } from 'react'
import { adminPanelClass } from '../adminStyles'

const PERIODS = [7, 15, 30] as const
type Period = (typeof PERIODS)[number]

// DATOS DE EJEMPLO: reemplazar por la respuesta del endpoint de métricas del producto
// cuando exista en el backend. Se escalan desde una base de 30 días.
function getSampleMetrics(productId: number, days: Period) {
  const base = 8 + (productId % 9) // Varía un poco entre productos para que no se vean todos iguales
  const ratio = days / 30
  const sold = Math.round(base * ratio)
  const visits = Math.round(base * 28 * ratio)
  const conversion = visits > 0 ? `${((sold / visits) * 100).toFixed(1).replace('.', ',')}%` : '—'
  return { sold, visits, conversion }
}

// Ventas, visitas y conversión del producto en un periodo (propuesta)
function ProductInsightsCard({ productId }: { productId: number }) {
  const [days, setDays] = useState<Period>(30)
  const { sold, visits, conversion } = getSampleMetrics(productId, days)

  const metrics = [
    { label: 'Vendidas', value: sold },
    { label: 'Visitas', value: visits.toLocaleString('es-CO') },
    { label: 'Conversión', value: conversion },
  ]

  return (
    <section className={adminPanelClass}>
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
        <h2 className="text-[15px] font-semibold">Últimos {days} días</h2>
        <span className="rounded border border-dashed border-[#cfcec8] px-1.5 py-px text-[10px] font-medium text-[#8b8a84]">
          Propuesta
        </span>
      </div>

      <div className="px-5 pt-3">
        <div role="radiogroup" aria-label="Periodo" className="inline-flex gap-0.5 rounded-[10px] bg-admin-active p-[3px]">
          {PERIODS.map((period) => {
            const isActive = period === days
            return (
              <button
                key={period}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setDays(period)}
                className={`h-[30px] rounded-[7px] px-3 text-[13px] font-medium tabular-nums transition-colors ${
                  isActive ? 'bg-white text-admin-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)]' : 'text-[#6b6a65] hover:text-admin-ink'
                }`}
              >
                {period} días
              </button>
            )
          })}
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 px-5 pb-4 pt-3.5">
        {metrics.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-[#6b6a65]">{label}</dt>
            <dd className="text-lg font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="px-5 pb-4 text-xs text-[#8b8a84]">Datos de ejemplo. Se conectarán al backend.</p>
    </section>
  )
}

export default ProductInsightsCard
