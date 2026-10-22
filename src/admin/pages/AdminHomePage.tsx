import { Link } from 'react-router'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { useProfile } from '../../features/profile/hooks/useProfile'
import { getDisplayName } from '../../utils/formatters'
import { SITE_NAME } from '../../config/site'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminCard from '../components/AdminCard'

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

// Espacio reservado mientras no existan los datos reales
function PlaceholderChart({ text, height = 'h-56' }: { text: string; height?: string }) {
  return (
    <div
      className={`flex ${height} items-center justify-center rounded-lg border border-dashed border-line px-4 text-center text-sm text-ink-muted`}
    >
      {text}
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AdminCard title="Ventas por mes" className="lg:col-span-2">
          <PlaceholderChart text="Aquí verás la gráfica de ventas de cada mes." />
        </AdminCard>

        <AdminCard title="Pedidos por estado">
          <PlaceholderChart text="Aquí verás cuántos pedidos hay en cada estado." />
        </AdminCard>

        <AdminCard
          title="Pedidos recientes"
          className="lg:col-span-3"
          actions={
            <Link
              to="/admin/pedidos"
              className="text-sm font-medium text-ink-muted hover:text-ink hover:underline"
            >
              Ver todos
            </Link>
          }
        >
          <PlaceholderChart text="Aquí verás los últimos pedidos de la tienda." height="h-40" />
        </AdminCard>
      </div>
    </>
  )
}

export default AdminHomePage