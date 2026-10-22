import { SITE_NAME } from '../../config/site'

interface AdminPlaceholderPageProps {
  title: string
}

// Provisional: cada sección se reemplazará por su página real
function AdminPlaceholderPage({ title }: AdminPlaceholderPageProps) {
  return (
    <section>
      <title>{`${title} | Admin ${SITE_NAME}`}</title>
      <h1 className="text-xl font-extrabold uppercase tracking-wide">{title}</h1>
      <p className="mt-4 text-sm text-ink-muted">Esta sección está en construcción.</p>
    </section>
  )
}

export default AdminPlaceholderPage