import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Eye, EyeOff, LayoutGrid, Search, X } from 'lucide-react'
import type { AdminCategoryNode } from '../../features/catalog/types'
import AdminTabs from './AdminTabs'
import type { AdminTab } from './AdminTabs'
import { adminInputClass } from '../adminStyles'

export type StatusFilter = 'todos' | 'activos' | 'inactivos'

const SEARCH_DELAY_MS = 400
const fieldClass = `${adminInputClass} h-10 py-0`

const statusTabs: AdminTab<StatusFilter>[] = [
  { value: 'todos', label: 'Todos', icon: LayoutGrid },
  { value: 'activos', label: 'Activos', icon: Eye },
  { value: 'inactivos', label: 'Inactivos', icon: EyeOff },
]

interface AdminProductFiltersProps {
  search: string
  categoryId: number | null
  status: StatusFilter
  categories: AdminCategoryNode[]
  counts?: Record<StatusFilter, number> // Cuántos productos hay en cada pestaña
  onSearchChange: (value: string) => void
  onCategoryChange: (id: number | null) => void
  onStatusChange: (status: StatusFilter) => void
}

function AdminProductFilters({
  search,
  categoryId,
  status,
  categories,
  counts,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
}: AdminProductFiltersProps) {
  const baseId = useId()

  // Lo que el admin escribe; la URL se actualiza cuando deja de escribir
  const [searchInput, setSearchInput] = useState(search)
  const timerRef = useRef<number | undefined>(undefined)

  // Si la búsqueda cambia desde fuera (ej: el buscador de la barra superior), se refleja aquí
  const [lastSearch, setLastSearch] = useState(search)
  if (search !== lastSearch) {
    setLastSearch(search)
    setSearchInput(search)
  }

  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => onSearchChange(value.trim()), SEARCH_DELAY_MS)
  }

  // Limpieza: si la página se cierra con una búsqueda pendiente, se cancela
  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const hasCategory = categoryId !== null

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {/* En celular el buscador va primero y ocupa todo el ancho */}
      <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
        <AdminTabs
          label="Estado de los productos"
          tabs={statusTabs.map((tab) => ({ ...tab, count: counts?.[tab.value] }))}
          value={status}
          onChange={onStatusChange}
        />
      </div>

      <div className="order-1 flex flex-col gap-2 sm:flex-row sm:items-center lg:order-2">
        <div className="relative w-full sm:flex-1 lg:w-72 lg:flex-none">
          <label htmlFor={`${baseId}-search`} className="sr-only">
            Buscar productos
          </label>
          <Search
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            id={`${baseId}-search`}
            type="search"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Buscar por nombre"
            className={`${fieldClass} pl-9`}
          />
        </div>

        {/* Categoría: cuando hay una elegida, el campo se resalta y muestra su propia "×" */}
        <div className="relative w-full sm:w-56">
          <label htmlFor={`${baseId}-category`} className="sr-only">
            Categoría
          </label>
          <select
            id={`${baseId}-category`}
            value={categoryId ?? ''}
            onChange={(e) => onCategoryChange(e.target.value === '' ? null : Number(e.target.value))}
            className={`${fieldClass} cursor-pointer appearance-none truncate ${
              hasCategory
                ? 'border-admin-accent/40 bg-admin-accent/5 pr-16 font-medium text-admin-accent'
                : 'pr-9'
            }`}
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
          {hasCategory && (
            <button
              type="button"
              onClick={() => onCategoryChange(null)}
              aria-label="Quitar filtro de categoría"
              title="Quitar filtro"
              className="absolute right-8 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-admin-accent transition-colors hover:bg-admin-accent/10"
            >
              <X size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
          <ChevronDown
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${
              hasCategory ? 'text-admin-accent' : 'text-ink-muted'
            }`}
          />
        </div>
      </div>
    </div>
  )
}

export default AdminProductFilters
