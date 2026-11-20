import { useEffect, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  CloudOff,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderTree,
  Layers,
  Plus,
  Search,
  ToggleRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SITE_NAME } from '../../config/site'
import { useAdminCategoryTree } from '../../features/catalog/hooks/useAdminCategoryTree'
import {
  useCreateCategory,
  useReorderCategory,
  useSetCategoryStatus,
  useUpdateCategory,
} from '../../features/catalog/hooks/useCategoryMutations'
import type { AdminCategoryNode } from '../../features/catalog/types'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminCard from '../components/AdminCard'
import AdminConfirmDialog from '../components/AdminConfirmDialog'
import AdminSwitch from '../components/AdminSwitch'
import { useAdminToast } from '../toast/toastContext'
import CategoryFormDialog from '../components/CategoryFormDialog'
import type { CategoryDialogState, CategoryFormValues } from '../components/CategoryFormDialog'
import StoreNavPreview from '../components/StoreNavPreview'
import {
  adminGhostButtonClass,
  adminOutlineButtonClass,
  adminPanelClass,
  adminSolidButtonClass,
} from '../adminStyles'
import { normalizeText } from '../../utils/text'

type StatusFilter = 'todas' | 'activas' | 'inactivas'
const EXPANDED_KEY = 'admin:categorias-expandidas'

// Lee las principales que el admin dejó desplegadas la última vez
function readExpanded(): Set<number> {
  try {
    const saved = JSON.parse(localStorage.getItem(EXPANDED_KEY) ?? '[]')
    return new Set(Array.isArray(saved) ? saved.filter((id) => typeof id === 'number') : [])
  } catch {
    return new Set()
  }
}

// Resalta la parte del texto que coincide con la búsqueda (ignorando tildes y mayúsculas)
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  // Se normaliza letra por letra para que las posiciones coincidan con el texto original
  const folded = [...text].map((char) => normalizeText(char) || char).join('')
  const start = folded.indexOf(query)
  if (start === -1 || folded.length !== text.length) return <>{text}</>
  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded-sm bg-amber-100 px-px text-inherit">{text.slice(start, start + query.length)}</mark>
      {text.slice(start + query.length)}
    </>
  )
}

// Columnas compartidas por el encabezado y las filas (solo computador)
const gridCols =
  'md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,180px)_104px_120px_72px_120px] md:items-center lg:grid-cols-[minmax(0,1fr)_minmax(0,200px)_110px_130px_72px_220px]'

const colHeadClass = 'py-2.5 text-xs font-medium text-[#8b8a84] whitespace-nowrap'

// Botón cuadrado de 32px (subir y bajar)
const arrowButtonClass =
  'inline-flex size-8 items-center justify-center rounded-lg text-[#3d3c38] transition-colors hover:bg-admin-hover disabled:cursor-not-allowed disabled:text-[#cfcec8] disabled:hover:bg-transparent'

// Pastillas de filtro (las mismas de la lista de productos)
const statusFilters: { value: StatusFilter; label: string; dot?: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'activas', label: 'Activas', dot: 'bg-[#2f9e5b]' },
  { value: 'inactivas', label: 'Inactivas', dot: 'bg-[#a3a29c]' },
]

// ─── Tarjeta de resumen ─────────────────────────────────────
function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
  return (
    <div className={`${adminPanelClass} flex items-center gap-3 px-[18px] py-4`}>
      <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-[10px] bg-admin-hover text-[#4a4945]">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-[13px] text-[#6b6a65]">{label}</p>
        <p className="text-xl font-semibold tracking-tight tabular-nums leading-tight">{value}</p>
      </div>
    </div>
  )
}

// ─── Una fila del árbol ─────────────────────────────────────
interface CategoryRowProps {
  category: AdminCategoryNode
  isChild: boolean
  isLastChild: boolean
  hiddenByParent: boolean
  isExpanded: boolean
  onToggleExpand?: () => void
  isFirst: boolean
  isLast: boolean
  canReorder: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  isReordering: boolean
  onEdit: () => void
  onAddChild?: () => void
  onToggleStatus: () => void
  isUpdating: boolean
  query: string
}

function CategoryRow({
  category,
  isChild,
  isLastChild,
  hiddenByParent,
  isExpanded,
  onToggleExpand,
  isFirst,
  isLast,
  canReorder,
  onMoveUp,
  onMoveDown,
  isReordering,
  onEdit,
  onAddChild,
  onToggleStatus,
  isUpdating,
  query,
}: CategoryRowProps) {
  const childCount = category.children.length
  const isVisible = category.isActive && !hiddenByParent
  const FolderIcon = isExpanded ? FolderOpen : Folder

  // Clic en la fila de una principal: despliega o recoge sus subcategorías
  // (salvo si el clic fue en un botón, como el interruptor o el menú ⋮)
  const canExpand = onToggleExpand !== undefined && childCount > 0
  // Un segundo clic seguido en el mismo punto es un doble clic: el navegador seleccionaría la
  // palabra y el clic se ignoraría como "seleccionando texto". Se evita esa selección.
  const handleRowMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (canExpand && e.detail > 1) e.preventDefault()
  }

  const handleRowClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!canExpand) return
    if ((e.target as HTMLElement).closest('a, button, input, [role="menu"]')) return
    if (window.getSelection()?.toString()) return // Está seleccionando texto
    onToggleExpand()
  }

  // Interruptor + texto; "Oculta" = activa, pero su principal está desactivada
  const statusText = isUpdating ? 'Guardando…' : !category.isActive ? 'Inactiva' : hiddenByParent ? 'Oculta' : 'Activa'
  const status = (
    <div className="flex items-center gap-2">
      <AdminSwitch
        size="sm"
        tone="ink"
        checked={category.isActive}
        disabled={isUpdating}
        label={category.isActive ? `Desactivar ${category.name}` : `Activar ${category.name}`}
        onChange={onToggleStatus}
      />
      <span
        className={`text-xs font-medium ${
          !category.isActive ? 'text-[#8b8a84]' : hiddenByParent ? 'text-[#8a5a00]' : 'text-[#1f7a45]'
        }`}
      >
        {statusText}
      </span>
    </div>
  )

  // Al filtrar no se puede reordenar: el aviso aparece al pasar el mouse sobre las flechas
  const reorderHint = canReorder ? undefined : 'El orden no se puede cambiar mientras filtras.'
  const reorderButtons = (
    <div className="flex items-center gap-0.5" title={reorderHint}>
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!canReorder || isFirst || isReordering}
        aria-label={`Subir ${category.name}`}
        title={reorderHint ?? 'Subir'}
        className={arrowButtonClass}
      >
        <ArrowUp size={15} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canReorder || isLast || isReordering}
        aria-label={`Bajar ${category.name}`}
        title={reorderHint ?? 'Bajar'}
        className={arrowButtonClass}
      >
        <ArrowDown size={15} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  )

  return (
    <div
      onClick={handleRowClick}
      onMouseDown={handleRowMouseDown}
      className={`group relative flex items-start gap-3 px-4 py-2.5 transition-colors md:gap-0 md:px-5 ${gridCols} ${
        isChild ? 'bg-[#fcfcfb] hover:bg-[#f8f8f6]' : 'hover:bg-[#fbfbfa]'
      } ${canExpand ? 'cursor-pointer' : ''}`}
    >
      {/* Nombre: con flecha, carpeta o conector de árbol */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {isChild ? (
          <span aria-hidden="true" className="relative ml-[59px] flex h-10 w-6 shrink-0">
            {/* Línea vertical y codo del árbol */}
            <span className={`absolute left-0 top-[-10px] w-px bg-[#e7e6e2] ${isLastChild ? 'h-[30px]' : 'bottom-[-10px]'}`} />
            <span className="absolute left-0 top-1/2 h-px w-4 bg-[#e7e6e2]" />
            <span className="absolute left-4 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-[#cfcec8]" />
          </span>
        ) : (
          <>
            {onToggleExpand && childCount > 0 ? (
              <button
                type="button"
                onClick={onToggleExpand}
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? 'Ocultar' : 'Mostrar'} subcategorías de ${category.name}`}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[#6b6a65] transition-colors hover:bg-admin-active"
              >
                <ChevronRight
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                  className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>
            ) : (
              <span aria-hidden="true" className="w-7 shrink-0" />
            )}
            <span
              aria-hidden="true"
              className={`flex size-9 shrink-0 items-center justify-center rounded-[10px] ${
                isVisible ? 'bg-admin-hover text-[#4a4945]' : 'bg-admin-bg text-[#a3a29c]'
              }`}
            >
              <FolderIcon size={18} strokeWidth={1.75} />
            </span>
          </>
        )}

        <div className="min-w-0">
          <p
            className={`break-words text-sm md:truncate ${isChild ? 'font-medium' : 'font-semibold'} ${
              isVisible ? 'text-admin-ink' : 'text-[#8b8a84]'
            }`}
          >
            <Highlight text={category.name} query={query} />
          </p>
          {/* En celular, el slug y el estado van bajo el nombre */}
          <div className="mt-1 flex flex-wrap items-center gap-2 md:hidden">
            <span className="break-all font-mono text-[11px] text-[#9a9993]">/{category.slug}</span>
            {status}
          </div>
          {hiddenByParent && (
            <p className="mt-0.5 text-xs font-medium text-[#8a5a00]">Oculta porque su categoría principal está desactivada.</p>
          )}
        </div>
      </div>

      {/* Columnas de computador */}
      <div className="hidden min-w-0 pr-4 md:block">
        <span className="block truncate font-mono text-xs text-[#6b6a65]">/{category.slug}</span>
      </div>
      <div className="hidden text-[13px] tabular-nums text-[#6b6a65] md:block">
        {isChild ? '—' : childCount}
      </div>
      <div className="hidden md:block">{status}</div>
      <div className="hidden md:block">{reorderButtons}</div>

      {/* Acciones */}
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
        <div className="md:hidden">{reorderButtons}</div>
        {onAddChild && (
          <button
            type="button"
            onClick={onAddChild}
            aria-label={`Agregar subcategoría a ${category.name}`}
            title="Agregar subcategoría"
            className={`${adminGhostButtonClass} px-2.5 lg:px-3`}
          >
            <FolderPlus size={15} strokeWidth={1.75} aria-hidden="true" className="lg:hidden" />
            <span className="hidden lg:inline">+ Subcategoría</span>
          </button>
        )}
        <button type="button" onClick={onEdit} aria-label={`Editar ${category.name}`} className={adminOutlineButtonClass}>
          Editar
        </button>
      </div>
    </div>
  )
}

// ─── Filas de carga ─────────────────────────────────────────
function TreeSkeleton() {
  return (
    <ul aria-label="Cargando categorías">
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index} className="flex animate-pulse items-center gap-3 border-t border-admin-row-line px-5 py-3.5 first:border-t-0">
          <div className="size-7 rounded-md bg-admin-active" />
          <div className="size-9 rounded-[10px] bg-admin-active" />
          <div className="h-3 w-40 rounded-md bg-admin-active" />
          <div className="ml-auto h-[34px] w-[90px] rounded-lg bg-[#f3f2ee]" />
        </li>
      ))}
    </ul>
  )
}

// ─── La página ──────────────────────────────────────────────
function AdminCategoriesPage() {
  const { data: tree, isPending, error } = useAdminCategoryTree()
  const setStatus = useSetCategoryStatus()
  const reorder = useReorderCategory()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const toast = useAdminToast()
  const [expanded, setExpanded] = useState<Set<number>>(readExpanded)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas')

  // Recuerda qué principales quedaron desplegadas
  useEffect(() => {
    try {
      localStorage.setItem(EXPANDED_KEY, JSON.stringify([...expanded]))
    } catch {
      // Sin almacenamiento (modo privado): no pasa nada
    }
  }, [expanded])
  const [toDeactivate, setToDeactivate] = useState<AdminCategoryNode | null>(null)
  const [dialog, setDialog] = useState<CategoryDialogState | null>(null)
  const [query, setQuery] = useState('')

  // ─── Búsqueda: muestra las principales que coinciden o tienen hijas que coinciden ──
  const normalizedQuery = normalizeText(query.trim())
  const isFiltering = normalizedQuery !== '' || statusFilter !== 'todas'
  const isSearching = isFiltering // Al buscar o filtrar, todo se muestra desplegado y sin reordenar
  const matchesStatus = (category: AdminCategoryNode) =>
    statusFilter === 'todas' || category.isActive === (statusFilter === 'activas')
  const matches = (category: AdminCategoryNode) =>
    matchesStatus(category) &&
    (normalizeText(category.name).includes(normalizedQuery) || category.slug.includes(normalizedQuery))

  const visibleTree = !tree
    ? []
    : !isSearching
      ? tree
      : tree.flatMap((root) => {
          if (matches(root)) return [root]
          const children = root.children.filter(matches)
          return children.length > 0 ? [{ ...root, children }] : []
        })

  // ─── Expandir y contraer ──────────────────────────────────
  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Expandir o contraer todas a la vez
  const allExpanded = tree !== undefined && tree.length > 0 && tree.every((root) => expanded.has(root.id))

  const toggleAll = () => {
    setExpanded(allExpanded || !tree ? new Set() : new Set(tree.map((root) => root.id)))
  }

  // ─── Activar y desactivar ─────────────────────────────────
  const handleToggleStatus = (category: AdminCategoryNode) => {
    if (category.isActive) {
      setStatus.reset()
      setToDeactivate(category)
    } else {
      activate(category)
    }
  }

  const activate = (category: AdminCategoryNode) => {
    setStatus.mutate(
      { id: category.id, active: true },
      {
        onSuccess: () => toast({ message: `"${category.name}" ya se ve en la tienda.` }),
        onError: (err) => toast({ tone: 'error', message: err.message }),
      },
    )
  }

  const confirmDeactivate = () => {
    if (!toDeactivate) return
    const category = toDeactivate
    setStatus.mutate(
      { id: category.id, active: false },
      {
        onSuccess: () => {
          setToDeactivate(null)
          toast({
            message: `"${category.name}" se ocultó de la tienda.`,
            action: { label: 'Deshacer', onClick: () => activate(category) },
          })
        },
      },
    )
  }

  const isUpdating = (id: number) => setStatus.isPending && setStatus.variables?.id === id

  // ─── Reordenar: toma el orden de la hermana de al lado ────
  const moveTo = (category: AdminCategoryNode, sibling: AdminCategoryNode) => {
    reorder.mutate(
      { id: category.id, newDisplayOrder: sibling.displayOrder },
      { onError: (err) => toast({ tone: 'error', message: err.message }) },
    )
  }

  // ─── Crear y editar ───────────────────────────────────────
  const openCreate = (parent: AdminCategoryNode | null) => {
    createCategory.reset()
    setDialog({ mode: 'create', parent })
    // Al agregar una subcategoría, se despliega su principal para verla aparecer
    if (parent) setExpanded((prev) => new Set(prev).add(parent.id))
  }

  const openEdit = (category: AdminCategoryNode) => {
    updateCategory.reset()
    setDialog({ mode: 'edit', category })
  }

  const closeDialog = () => setDialog(null)

  const handleSubmitCategory = (values: CategoryFormValues, { another }: { another: boolean }) => {
    if (!dialog) return

    if (dialog.mode === 'create') {
      createCategory.mutate(
        { name: values.name, slug: values.slug, parentCategoryId: values.parentId },
        {
          onSuccess: () => {
            toast({ message: `Categoría "${values.name}" creada.` })
            if (!another) {
              closeDialog()
              return
            }
            // Deja el diálogo abierto y en blanco, con la misma principal elegida
            const parent = tree?.find((root) => root.id === values.parentId) ?? null
            createCategory.reset()
            setDialog({ mode: 'create', parent, resetKey: Date.now() })
          },
        },
      )
    } else {
      updateCategory.mutate(
        { id: dialog.category.id, request: { name: values.name, slug: values.slug } },
        {
          onSuccess: () => {
            closeDialog()
            toast({ message: 'Cambios guardados.' })
          },
        },
      )
    }
  }

  const activeSave = dialog?.mode === 'edit' ? updateCategory : createCategory

  // ─── Las filas de un nivel (principales o hijas de una) ───
  const renderRows = (siblings: AdminCategoryNode[], parent: AdminCategoryNode | null) =>
    siblings.map((category, index) => {
      const isRoot = parent === null
      // Al buscar, todo se muestra desplegado
      const isExpanded = isSearching || expanded.has(category.id)

      return (
        <li key={category.id} className={isRoot ? 'border-t border-admin-row-line' : ''}>
          <CategoryRow
            category={category}
            isChild={!isRoot}
            isLastChild={!isRoot && index === siblings.length - 1}
            hiddenByParent={parent !== null && !parent.isActive && category.isActive}
            isExpanded={isExpanded}
            onToggleExpand={isRoot && !isSearching ? () => toggleExpand(category.id) : undefined}
            isFirst={index === 0}
            isLast={index === siblings.length - 1}
            canReorder={!isSearching}
            onMoveUp={() => moveTo(category, siblings[index - 1])}
            onMoveDown={() => moveTo(category, siblings[index + 1])}
            isReordering={reorder.isPending}
            onEdit={() => openEdit(category)}
            onAddChild={isRoot ? () => openCreate(category) : undefined}
            onToggleStatus={() => handleToggleStatus(category)}
            isUpdating={isUpdating(category.id)}
            query={normalizedQuery}
          />

          {isRoot && isExpanded && category.children.length > 0 && (
            <ul className="border-t border-[#f6f5f2]">{renderRows(category.children, category)}</ul>
          )}
        </li>
      )
    })

  // ─── Resumen ──────────────────────────────────────────────
  const rootCount = tree?.length ?? 0
  const childCount = tree?.reduce((sum, root) => sum + root.children.length, 0) ?? 0
  const activeCount =
    tree?.reduce((sum, root) => sum + (root.isActive ? 1 : 0) + root.children.filter((c) => c.isActive).length, 0) ?? 0
  const inactiveCount = rootCount + childCount - activeCount

  // ─── Contenido según el estado ────────────────────────────
  let content
  if (isPending) {
    content = <TreeSkeleton />
  } else if (error) {
    content = (
      <div role="alert" className="flex flex-col items-center gap-2 px-6 py-14 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#fdecea] text-[#b42318]">
          <CloudOff size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <p className="mt-1 text-[15px] font-semibold">No pudimos cargar las categorías</p>
        <p className="max-w-[340px] text-sm text-[#6b6a65]">{error.message}</p>
      </div>
    )
  } else if (tree.length === 0) {
    content = (
      <div className="flex flex-col items-center gap-2 px-6 pb-[68px] pt-16 text-center">
        <span className="flex size-[52px] items-center justify-center rounded-[14px] bg-admin-hover text-[#4a4945]">
          <FolderTree size={24} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="mt-1.5 text-base font-semibold">Todavía no hay categorías</p>
        <p className="max-w-[380px] text-sm text-[#6b6a65]">Crea la primera para organizar tu catálogo.</p>
        <button type="button" onClick={() => openCreate(null)} className={`${adminSolidButtonClass} mt-2.5`}>
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          Nueva categoría
        </button>
      </div>
    )
  } else if (visibleTree.length === 0) {
    content = (
      <p className="px-5 py-12 text-center text-sm text-[#6b6a65]">
        {normalizedQuery
          ? `Ninguna categoría coincide con “${query.trim()}”.`
          : statusFilter === 'inactivas'
            ? 'No hay categorías inactivas.'
            : 'No hay categorías activas.'}
      </p>
    )
  } else {
    content = (
      <>
        {/* Encabezado de columnas */}
        <div className={`hidden px-5 ${gridCols}`}>
          <span className={`${colHeadClass} pl-[88px]`}>Categoría</span>
          <span className={colHeadClass}>Slug</span>
          <span className={colHeadClass}>Subcategorías</span>
          <span className={colHeadClass}>Estado</span>
          <span className={colHeadClass}>Orden</span>
          <span className={colHeadClass}>
            <span className="sr-only">Acciones</span>
          </span>
        </div>
        <ul>{renderRows(visibleTree, null)}</ul>
        <p className="border-t border-admin-row-line px-5 py-3 text-[13px] text-[#8b8a84]">
          El orden de esta lista es el orden del menú en tu tienda.
        </p>
      </>
    )
  }

  const deactivateMessage =
    toDeactivate && toDeactivate.children.length > 0
      ? `Dejará de verse en la tienda, y sus ${toDeactivate.children.length} subcategorías quedarán ocultas. Al reactivarla, todo volverá como estaba.`
      : 'Dejará de verse en la tienda. Podrás activarla de nuevo cuando quieras.'


  return (
    <>
      <title>{`Categorías | Admin ${SITE_NAME}`}</title>

      <AdminPageHeader
        title="Categorías"
        description="Organiza las categorías y subcategorías que ven los clientes en el menú."
        actions={
          <button type="button" onClick={() => openCreate(null)} className={`${adminSolidButtonClass} pl-3.5`}>
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            Nueva categoría
          </button>
        }
      />

      {tree && tree.length > 0 && (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile icon={FolderTree} label="Categorías principales" value={rootCount} />
          <StatTile icon={Layers} label="Subcategorías" value={childCount} />
          <StatTile
            icon={ToggleRight}
            label="Activas"
            value={
              <>
                {activeCount}
                <span className="text-sm font-normal text-[#8b8a84]"> de {rootCount + childCount}</span>
              </>
            }
          />
        </div>
      )}

      {tree && tree.length > 0 && (
        <AdminCard
          className="mb-4"
          title="Vista previa en la tienda"
          description="Así ven los clientes el menú. Se actualiza con cada cambio."
        >
          <StoreNavPreview tree={tree} />
        </AdminCard>
      )}

      {tree && tree.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2.5">
          <label
            htmlFor="category-search"
            className="flex h-[38px] min-w-0 flex-[1_1_260px] items-center gap-2 rounded-[9px] border border-[#e2e1dc] bg-white px-3 text-[#8b8a84] transition-colors focus-within:border-admin-accent focus-within:ring-4 focus-within:ring-admin-accent/10"
          >
            <Search size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
            <span className="sr-only">Buscar categorías</span>
            <input
              id="category-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o slug"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-admin-ink placeholder:text-[#8b8a84] focus:outline-none"
            />
          </label>

          <div role="radiogroup" aria-label="Estado de las categorías" className="flex max-w-full gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
            {statusFilters.map(({ value, label, dot }) => {
              const isActive = value === statusFilter
              const count = value === 'todas' ? rootCount + childCount : value === 'activas' ? activeCount : inactiveCount
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setStatusFilter(value)}
                  className={`flex h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] border px-3 text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'border-admin-ink bg-admin-ink text-white'
                      : 'border-[#e2e1dc] bg-white text-[#3d3c38] hover:border-[#cbcac4]'
                  }`}
                >
                  {dot && <span aria-hidden="true" className={`size-[7px] rounded-full ${dot}`} />}
                  {label}
                  <span className={`tabular-nums ${isActive ? 'text-[#c9c8c2]' : 'text-[#9a9993]'}`}>{count}</span>
                </button>
              )
            })}
          </div>

          {!isSearching && (
            <button type="button" onClick={toggleAll} className={adminGhostButtonClass}>
              {allExpanded ? (
                <ChevronsDownUp size={15} strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <ChevronsUpDown size={15} strokeWidth={1.75} aria-hidden="true" />
              )}
              {allExpanded ? 'Contraer todas' : 'Expandir todas'}
            </button>
          )}
        </div>
      )}

      <section className={`${adminPanelClass} overflow-hidden max-md:[&>ul>li:first-child]:border-t-0`}>{content}</section>



      <AdminConfirmDialog
        isOpen={toDeactivate !== null}
        title={`¿Desactivar "${toDeactivate?.name ?? ''}"?`}
        message={deactivateMessage}
        confirmLabel="Desactivar"
        loadingLabel="Desactivando..."
        isLoading={setStatus.isPending}
        error={setStatus.error?.message ?? null}
        onConfirm={confirmDeactivate}
        onCancel={() => setToDeactivate(null)}
      />

      <CategoryFormDialog
        state={dialog}
        roots={tree ?? []}
        isSaving={activeSave.isPending}
        serverError={activeSave.error?.message ?? null}
        onSubmit={handleSubmitCategory}
        onClose={closeDialog}
      />
    </>
  )
}

export default AdminCategoriesPage
