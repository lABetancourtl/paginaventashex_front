import { SITE_NAME } from '../../config/site'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminCard from '../components/AdminCard'

interface AdminPlaceholderPageProps {
  title: string
}

// Provisional: cada sección se reemplazará por su página real
function AdminPlaceholderPage({ title }: AdminPlaceholderPageProps) {
  return (
    <>
      <title>{`${title} | Admin ${SITE_NAME}`}</title>
      <AdminPageHeader title={title} />
      <AdminCard>
        <p className="text-sm text-ink-muted">Esta sección está en construcción.</p>
      </AdminCard>
    </>
  )
}

export default AdminPlaceholderPage