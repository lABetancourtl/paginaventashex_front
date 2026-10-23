import { useEffect, useId, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { inputClass } from '../../components/formStyles'
import type { AdminCategoryNode } from '../../features/catalog/types'
import { adminSecondaryButtonClass } from '../adminStyles'

export type StatusFilter = 'todos' | 'activos' | 'inactivos'

const SEARCH_DELAY_MS = 400
const fieldClass = `${inputClass} rounded-lg py-2 text-sm`

interface AdminProductFiltersProps {
  search: string
  categoryId: number | null
  status: StatusFilter
  categories: AdminCategoryNode[]
  onSearchChange: (value: string) => void
  onCategoryChange: (id: number | null) => void
  onStatusChange: (status: StatusFilter) => void
  onClear: () => void
}

function AdminProductFilters({
  search,
  categoryId,
  status,
  categories,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onClear,
}: AdminProductFiltersProps) {
  const baseId = useId()

  // Lo que el admin escribe; la URL se actualiza cuando deja de escribir
  const [searchInput, setSearchInput] = useState(search)
  const timerRef = useRef<number | undefined>(undefined)

  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => onSearchChange(value.trim()), SEARCH_DELAY_MS)
  }

  // Limpieza: si la página se cierra con una búsqueda pendiente, se cancela
  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const hasFilters = search !== '' || categoryId !== null || status !== 'todos'

  const handleClear = () => {
    window.clearTimeout(timerRef.current)
    setSearchInput('')
    onClear()
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end">
      <div className="md:flex-1">
        <label htmlFor={`${baseId}-search`} className="sr-only">
          Buscar productos
        </label>
        <div className="relative">
          <Search
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            id={`${baseId}-search`}
            type="search"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Buscar por nombre o SKU"
            className={`${fieldClass} pl-9`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:flex">
        <div>
          <label htmlFor={`${baseId}-category`} className="sr-only">
            Categoría
          </label>
          <select
            id={`${baseId}-category`}
            value={categoryId ?? ''}
            onChange={(e) => onCategoryChange(e.target.value === '' ? null : Number(e.target.value))}
            className={`${fieldClass} md:w-52`}
          >
            <option value="">Todas las categorías</option>
            {categories.map((root) => (
              <optgroup key={root.id} label={root.name}>
                <option value={root.id}>{root.name} (todas)</option>
                {root.children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${baseId}-status`} className="sr-only">
            Estado
          </label>
          <select
            id={`${baseId}-status`}
            value={status}
            onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
            className={`${fieldClass} md:w-36`}
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>
      </div>

      {hasFilters && (
        <button type="button" onClick={handleClear} className={`${adminSecondaryButtonClass} py-2`}>
          <X size={14} strokeWidth={1.5} aria-hidden="true" />
          Limpiar filtros
        </button>
      )}
    </div>
  )
}

export default AdminProductFilters