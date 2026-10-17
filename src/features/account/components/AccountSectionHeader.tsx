import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'

interface AccountSectionHeaderProps {
  title: string
  desktopTitle?: boolean // ¿El título también se ve en computador?
}

function AccountSectionHeader({ title, desktopTitle = false }: AccountSectionHeaderProps) {
  return (
    <div className={`mb-4 flex items-center gap-3 ${desktopTitle ? '' : 'md:mb-0'}`}>
      {/* La flecha solo en celular: en computador está el menú lateral */}
      <Link
        to="/cuenta"
        aria-label="Volver a mi cuenta"
        className="p-1 hover:text-ink-muted md:hidden"
      >
        <ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" />
      </Link>

      <h2
        className={`text-lg font-extrabold uppercase tracking-wide ${desktopTitle ? '' : 'md:sr-only'}`}
      >
        {title}
      </h2>
    </div>
  )
}

export default AccountSectionHeader