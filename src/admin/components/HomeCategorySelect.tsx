import type { AdminCategoryNode } from '../../features/catalog/types'
import { ChevronDown } from 'lucide-react'
import { adminTextFieldClass } from '../adminStyles'

interface HomeCategorySelectProps {
  id: string
  value: number | null
  onChange: (categoryId: number | null) => void
  tree: AdminCategoryNode[]
  emptyLabel: string // Ej: "Sin enlace" o "Sin botón Ver todo"
  disabled?: boolean
  describedBy?: string
  className?: string
}

// Selector de categoría (raíz o subcategoría). Las desactivadas no sirven como
// enlace en la tienda, así que se marcan y no se pueden elegir (salvo si ya lo están)
function HomeCategorySelect({
  id,
  value,
  onChange,
  tree,
  emptyLabel,
  disabled = false,
  describedBy,
  className = 'h-10',
}: HomeCategorySelectProps) {
  const option = (category: AdminCategoryNode, hiddenByParent: boolean, label: string) => {
    const usable = category.isActive && !hiddenByParent
    return (
      <option key={category.id} value={category.id} disabled={!usable && category.id !== value}>
        {label}
        {!usable ? ' (inactiva)' : ''}
      </option>
    )
  }

  return (
    <div className="relative">
    <select
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      disabled={disabled}
      aria-describedby={describedBy}
      className={`${adminTextFieldClass} cursor-pointer appearance-none truncate pr-9 ${className}`}
    >
      <option value="">{emptyLabel}</option>
      {tree.map((root) => (
        <optgroup key={root.id} label={root.name}>
          {option(root, false, `Todo ${root.name}`)}
          {root.children.map((child) => option(child, !root.isActive, child.name))}
        </optgroup>
      ))}
    </select>
      <ChevronDown
        size={15}
        strokeWidth={1.75}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8b8a84]"
      />
    </div>
  )
}

export default HomeCategorySelect
