import type { ReactNode } from 'react'

interface AccountSectionHeaderProps {
  title: string
  action?: ReactNode // Acción principal a la derecha del título (por ejemplo, "Añadir dirección")
}

// Fila de alto fijo, para que el título no se mueva al cambiar de pestaña
function AccountSectionHeader({ title, action }: AccountSectionHeaderProps) {
  return (
    <div className="mb-4 flex h-10 items-center justify-between gap-3">
      <h2 className="text-base font-bold uppercase tracking-wide">{title}</h2>
      {action}
    </div>
  )
}

export default AccountSectionHeader
