import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import type { AdminCategoryNode } from '../../features/catalog/types'

export type StatusFilter = 'todos' | 'activos' | 'inactivos'

const SEARCH_DELAY_MS = 400

const statusFilters: { value: StatusFilter; label: string; dot?: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'Visibles', dot: 'bg-[#2f9e5b]' },
  { value: 'inactivos', label: 'Ocultos', dot: 'bg-[#a3a29c]' },
]

// Alto común de los controles de la barra
const controlClass = 'h-[38px] rounded-[9px] border text-sm transition-colors'

interface AdminProductFiltersProps {
  search: string
  categoryId: number | null
  status: StatusFilter
  categories: AdminCategoryNode[]
  counts?: Record<StatusFilter, number> // Cuántos productos hay en cada filtro
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

  const clearSearch = () => {
    window.clearTimeout(timerRef.current)
    setSearchInput('')
    onSearchChange('')
  }

  // Limpieza: si la página se cierra con una búsqueda pendiente, se cancela
  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const hasCategory = categoryId !== null

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
      {/* Buscador: ocupa el espacio que sobre */}
      <label
        htmlFor={`${baseId}-search`}
        className={`${controlClass} flex min-w-0 flex-[1_1_260px] items-center gap-2 border-[#e2e1dc] bg-white px-3 text-[#8b8a84] focus-within:border-admin-accent focus-within:ring-4 focus-within:ring-admin-accent/10`}
      >
        <Search size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
        <span className="sr-only">Buscar productos</span>
        <input
          id={`${baseId}-search`}
          type="search"
          value={searchInput}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="Buscar por nombre"
          className="min-w-0 flex-1 border-0 bg-transparent text-sm text-admin-ink placeholder:text-[#8b8a84] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {searchInput !== '' && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Borrar búsqueda"
            className="-mr-1 flex size-7 shrink-0 items-center justify-center rounded-md hover:bg-admin-hover hover:text-admin-ink"
          >
            <X size={14} strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </label>

      <div className="flex max-w-full gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
        {/* Categoría: cuando hay una elegida, se pinta como filtro activo y muestra su "×" */}
        <div className="relative shrink-0">
          <label htmlFor={`${baseId}-category`} className="sr-only">
            Categoría
          </label>
          <select
            id={`${baseId}-category`}
            value={categoryId ?? ''}
            onChange={(e) => onCategoryChange(e.target.value === '' ? null : Number(e.target.value))}
            className={`${controlClass} max-w-56 cursor-pointer appearance-none truncate pl-3 text-[13px] font-medium focus:outline-none focus-visible:ring-4 focus-visible:ring-admin-accent/10 ${
              hasCategory
                ? 'border-admin-ink bg-admin-ink pr-14 text-white'
                : 'border-[#e2e1dc] bg-white pr-8 text-[#3d3c38] hover:border-[#cbcac4]'
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
              className="absolute right-7 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-white/80 hover:bg-white/15 hover:text-white"
            >
              <X size={13} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
          <ChevronDown
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${
              hasCategory ? 'text-white/80' : 'text-[#8b8a84]'
            }`}
          />
        </div>

        {/* Estado: pastillas con contador */}
        <div role="radiogroup" aria-label="Estado de los productos" className="flex gap-1.5">
          {statusFilters.map(({ value, label, dot }) => {
            const isActive = value === status
            const count = counts?.[value]
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onStatusChange(value)}
                className={`${controlClass} flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 text-[13px] font-medium ${
                  isActive
                    ? 'border-admin-ink bg-admin-ink text-white'
                    : 'border-[#e2e1dc] bg-white text-[#3d3c38] hover:border-[#cbcac4]'
                }`}
              >
                {dot && <span aria-hidden="true" className={`size-[7px] rounded-full ${dot}`} />}
                {label}
                {count !== undefined && (
                  <span className={`tabular-nums ${isActive ? 'text-[#c9c8c2]' : 'text-[#9a9993]'}`}>{count}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AdminProductFilters
