import { ArrowDownRight, ArrowUpRight, Calendar } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  icon: LucideIcon
  value: string | null // Ya formateado (ej: "$ 1.250.000"); null = sin datos
  trend?: number | null // Variación en % frente al periodo anterior
  period?: string // Ej: "Este mes"
}

// Tarjeta de indicador. Mientras no haya datos muestra un espacio en blanco.
function KpiCard({ title, icon: Icon, value, trend = null, period }: KpiCardProps) {
  const hasValue = value !== null
  const isUp = trend !== null && trend >= 0

  return (
    <section className="flex flex-col rounded-2xl border border-admin-line bg-white shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
      <div className="flex items-center justify-between gap-3 border-b border-admin-line px-5 py-3.5">
        <h2 className="text-sm font-medium text-ink">{title}</h2>
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-lg bg-admin-bg text-ink-muted"
        >
          <Icon size={16} strokeWidth={1.75} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-4">
        {period && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-admin-line bg-admin-bg px-2 py-1 text-[11px] font-medium text-ink-muted">
            <Calendar size={12} strokeWidth={1.75} aria-hidden="true" />
            {period}
          </span>
        )}

        <div className="mt-auto flex items-end justify-between gap-3">
          {hasValue ? (
            <p className="text-[26px] font-semibold leading-none tracking-tight tabular-nums text-ink">{value}</p>
          ) : (
            <p className="flex items-center gap-2" aria-label="Sin datos todavía">
              <span aria-hidden="true" className="text-[26px] font-semibold leading-none text-ink-muted/40">
                —
              </span>
              <span aria-hidden="true" className="h-2.5 w-20 rounded-full bg-admin-bg" />
            </p>
          )}

          {trend !== null ? (
            <span
              className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                isUp ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {isUp ? (
                <ArrowUpRight size={12} strokeWidth={2.25} aria-hidden="true" />
              ) : (
                <ArrowDownRight size={12} strokeWidth={2.25} aria-hidden="true" />
              )}
              {Math.abs(trend).toFixed(2)}%
            </span>
          ) : (
            <span className="rounded-md border border-dashed border-admin-line px-1.5 py-0.5 text-[11px] font-medium text-ink-muted/70">
              —&nbsp;%
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

export default KpiCard
