import { Link } from 'react-router'
import { DollarSign, Receipt, ShoppingBag, UserPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { useProfile } from '../../features/profile/hooks/useProfile'
import { getDisplayName } from '../../utils/formatters'
import { SITE_NAME } from '../../config/site'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminCard from '../components/AdminCard'
import KpiCard from '../components/KpiCard'
import { adminThClass } from '../adminStyles'

const longDateFormatter = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

// "miércoles, 22 de octubre de 2026" → "Miércoles, 22 de octubre de 2026"
function formatToday(): string {
  const text = longDateFormatter.format(new Date())
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// ─── Indicadores ────────────────────────────────────────────
// PROVISIONAL: value y trend en null hasta conectar las métricas reales
interface Kpi {
  title: string
  icon: LucideIcon
  value: string | null
  trend: number | null
  period?: string
}

const kpis: Kpi[] = [
  { title: 'Ingresos', icon: DollarSign, value: null, trend: null, period: 'Este mes' },
  { title: 'Pedidos nuevos', icon: Receipt, value: null, trend: null, period: 'Este mes' },
  { title: 'Ticket promedio', icon: ShoppingBag, value: null, trend: null, period: 'Este mes' },
  { title: 'Clientes nuevos', icon: UserPlus, value: null, trend: null, period: 'Este mes' },
]

const reportRows = ['Ingresos totales', 'Unidades vendidas', 'Pedidos totales', 'Clientes totales']

// Alturas de las barras fantasma de la gráfica vacía
const ghostBars = [62, 34, 80, 48]

// ─── Piezas vacías ──────────────────────────────────────────
function EmptyChart() {
  return (
    <div className="relative h-64">
      <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between pb-7">
        {[0, 1, 2, 3, 4].map((line) => (
          <div key={line} className="border-t border-dashed border-admin-line" />
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-x-6 bottom-7 top-0 flex items-end justify-around gap-4">
        {ghostBars.map((height, index) => (
          <div key={index} className="w-full max-w-14 rounded-t-lg bg-admin-bg" style={{ height: `${height}%` }} />
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-x-6 bottom-0 flex justify-around text-[11px] text-ink-muted">
        {['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'].map((week) => (
          <span key={week}>{week}</span>
        ))}
      </div>
      <p className="absolute inset-0 flex items-center justify-center text-sm text-ink-muted">
        <span className="rounded-full border border-admin-line bg-white px-3 py-1 shadow-sm">
          Aún no hay datos de ventas
        </span>
      </p>
    </div>
  )
}

function AdminHomePage() {
  const { session } = useAuth()
  const { data: profile } = useProfile()

  const name = session ? getDisplayName(profile?.nombre, session.email) : ''

  return (
    <>
      <title>{`Dashboard | Admin ${SITE_NAME}`}</title>

      <AdminPageHeader title={`Hola, ${name}`} description={formatToday()} />

      {/* Indicadores */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AdminCard title="Ventas por semana" description="Ingresos de las últimas 4 semanas" className="lg:col-span-2">
          <EmptyChart />
        </AdminCard>

        <AdminCard title="Reporte general">
          <ul className="space-y-2.5">
            {reportRows.map((row) => (
              <li key={row} className="rounded-xl border border-admin-line px-4 py-3">
                <p className="text-[13px] text-ink-muted">{row}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-lg font-semibold text-ink-muted/40">—</span>
                  <span aria-hidden="true" className="h-2 w-12 rounded-full bg-admin-bg" />
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard
          title="Pedidos recientes"
          className="lg:col-span-3"
          flush
          actions={
            <Link to="/admin/pedidos" className="text-sm font-medium text-admin-accent hover:underline">
              Ver todos
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-admin-line">
                <tr>
                  {['Pedido', 'Cliente', 'Producto', 'Total', 'Ciudad', 'Estado'].map((column) => (
                    <th key={column} scope="col" className={adminThClass}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-ink-muted">
                    Aquí verás los últimos pedidos de la tienda.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>
    </>
  )
}

export default AdminHomePage
