import { Link } from 'react-router'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { SITE_NAME } from '../../config/site'
import { adminLinks } from '../adminLinks'

function AdminHomePage() {
  const { session } = useAuth()

  // Todas las secciones menos "Inicio"
  const sections = adminLinks.filter((link) => !link.end)

  return (
    <section>
      <title>{`Panel de administración | ${SITE_NAME}`}</title>

      <h1 className="text-xl font-extrabold uppercase tracking-wide">Panel de administración</h1>
      <p className="mt-1 text-sm text-ink-muted">Sesión iniciada como {session?.email}</p>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ to, label, description, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex h-full flex-col border border-line p-6 transition-colors hover:border-ink/60"
            >
              <Icon size={24} strokeWidth={1.25} aria-hidden="true" className="text-ink-muted" />
              <span className="mt-4 text-sm font-bold uppercase tracking-wide">{label}</span>
              <span className="mt-1 text-sm text-ink-muted">{description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default AdminHomePage