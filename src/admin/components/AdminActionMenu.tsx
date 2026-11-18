import { Link } from 'react-router'
import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from '@headlessui/react'
import { MoreVertical } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { adminIconButtonClass } from '../adminStyles'

export type ActionMenuItem =
  | {
      label: string
      icon: LucideIcon
      onClick?: () => void
      to?: string // Si tiene "to", es un enlace
      danger?: boolean
      disabled?: boolean
    }
  | 'separator'

interface AdminActionMenuProps {
  label: string // Para lectores de pantalla, ej: "Acciones de Camiseta azul"
  items: ActionMenuItem[]
}

const itemClass = [
  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm',
  'data-focus:bg-admin-bg data-disabled:cursor-not-allowed data-disabled:opacity-50',
].join(' ')

// Menú de tres puntos con las acciones de una fila
function AdminActionMenu({ label, items }: AdminActionMenuProps) {
  return (
    <Menu>
      <MenuButton aria-label={label} className={`${adminIconButtonClass} data-open:bg-admin-bg data-open:text-ink`}>
        <MoreVertical size={16} strokeWidth={1.75} aria-hidden="true" />
      </MenuButton>

      <MenuItems
        anchor={{ to: 'bottom end', gap: 4 }}
        className="z-40 w-52 animate-admin-fade rounded-xl border border-admin-line bg-white p-1 shadow-lg shadow-black/5 focus:outline-none"
      >
        {items.map((item, index) => {
          if (item === 'separator') {
            return <MenuSeparator key={`sep-${index}`} className="my-1 h-px bg-admin-line" />
          }

          const { label: itemLabel, icon: Icon, onClick, to, danger, disabled } = item
          const content = (
            <>
              <Icon size={15} strokeWidth={1.75} aria-hidden="true" className={danger ? '' : 'text-ink-muted'} />
              {itemLabel}
            </>
          )
          const color = danger ? 'text-danger' : 'text-ink'

          return (
            <MenuItem key={itemLabel} disabled={disabled}>
              {to ? (
                <Link to={to} className={`${itemClass} ${color}`}>
                  {content}
                </Link>
              ) : (
                <button type="button" onClick={onClick} className={`${itemClass} ${color}`}>
                  {content}
                </button>
              )}
            </MenuItem>
          )
        })}
      </MenuItems>
    </Menu>
  )
}

export default AdminActionMenu
