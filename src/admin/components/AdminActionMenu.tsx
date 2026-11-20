import { Link } from 'react-router'
import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from '@headlessui/react'
import { MoreVertical } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { adminIconButtonClass, adminMenuItemClass, adminMenuPanelClass } from '../adminStyles'

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


// Menú de tres puntos con las acciones de una fila
function AdminActionMenu({ label, items }: AdminActionMenuProps) {
  return (
    <Menu>
      <MenuButton aria-label={label} className={`${adminIconButtonClass} data-open:bg-admin-hover data-open:text-admin-ink`}>
        <MoreVertical size={16} strokeWidth={1.75} aria-hidden="true" />
      </MenuButton>

      <MenuItems
        anchor={{ to: 'bottom end', gap: 4 }}
        className={`${adminMenuPanelClass} w-52`}
      >
        {items.map((item, index) => {
          if (item === 'separator') {
            return <MenuSeparator key={`sep-${index}`} className="my-1 h-px bg-admin-row-line" />
          }

          const { label: itemLabel, icon: Icon, onClick, to, danger, disabled } = item
          const content = (
            <>
              <Icon size={15} strokeWidth={1.75} aria-hidden="true" className={danger ? '' : 'text-[#6b6a65]'} />
              {itemLabel}
            </>
          )
          const color = danger ? 'text-danger!' : ''

          return (
            <MenuItem key={itemLabel} disabled={disabled}>
              {to ? (
                <Link to={to} className={`${adminMenuItemClass} ${color}`}>
                  {content}
                </Link>
              ) : (
                <button type="button" onClick={onClick} className={`${adminMenuItemClass} ${color}`}>
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
