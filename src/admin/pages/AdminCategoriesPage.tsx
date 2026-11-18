import { useEffect, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Eye,
  EyeOff,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderTree,
  LayoutGrid,
  Layers,
  Pencil,
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
import AdminActionMenu from '../components/AdminActionMenu'
import type { ActionMenuItem } from '../components/AdminActionMenu'
import AdminSwitch from '../components/AdminSwitch'
import AdminTabs from '../components/AdminTabs'
import { useAdminToast } from '../toast/toastContext'
import CategoryFormDialog from '../components/CategoryFormDialog'
import type { CategoryDialogState, CategoryFormValues } from '../components/CategoryFormDialog'
import StoreNavPreview from '../components/StoreNavPreview'
import {
  adminIconButtonClass,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
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
const gridCols = 'md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,200px)_110px_130px_80px_48px] md:items-center'

const colHeadClass = 'py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted whitespace-nowrap'

// ─── Tarjeta de resumen ─────────────────────────────────────
function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-admin-line bg-white px-4 py-3.5 shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
      <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-admin-bg text-ink-muted">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="text-lg font-semibold tabular-nums leading-tight">{value}</p>
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

  // Activar y desactivar se hace con el interruptor de la columna Estado
  const actions: ActionMenuItem[] = [
    { label: 'Editar', icon: Pencil, onClick: onEdit },
    ...(onAddChild ? [{ label: 'Agregar subcategoría', icon: FolderPlus, onClick: onAddChild }] : []),
  ]

  // Clic en la fila de una principal: despliega o recoge sus subcategorías
  // (salvo si el clic fue en un botón, como el interruptor o el menú ⋮)
  const canExpand = onToggleExpand !== undefined && childCount > 0
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
        checked={category.isActive}
        disabled={isUpdating}
        label={category.isActive ? `Desactivar ${category.name}` : `Activar ${category.name}`}
        onChange={onToggleStatus}
      />
      <span
        className={`text-xs font-medium ${
          !category.isActive ? 'text-ink-muted' : hiddenByParent ? 'text-amber-700' : 'text-green-700'
        }`}
      >
        {statusText}
      </span>
    </div>
  )

  const reorderButtons = (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!canReorder || isFirst || isReordering}
        aria-label={`Subir ${category.name}`}
        title="Subir"
        className={`${adminIconButtonClass} size-7`}
      >
        <ArrowUp size={15} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canReorder || isLast || isReordering}
        aria-label={`Bajar ${category.name}`}
        title="Bajar"
        className={`${adminIconButtonClass} size-7`}
      >
        <ArrowDown size={15} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  )

  return (
    <div
      onClick={handleRowClick}
      className={`group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-admin-bg/50 md:gap-0 md:px-5 ${gridCols} ${
        isChild ? 'bg-admin-bg/30' : ''
      } ${canExpand ? 'cursor-pointer' : ''}`}
    >
      {/* Nombre: con flecha, carpeta o conector de árbol */}
      <div className={`flex min-w-0 flex-1 items-center gap-3 ${isVisible ? '' : 'opacity-60'}`}>
        {isChild ? (
          <span aria-hidden="true" className="relative ml-[59px] flex h-10 w-6 shrink-0">
            {/* Línea vertical y codo del árbol */}
            <span className={`absolute left-0 top-[-12px] w-px bg-admin-line ${isLastChild ? 'h-[32px]' : 'bottom-[-12px]'}`} />
            <span className="absolute left-0 top-1/2 h-px w-4 bg-admin-line" />
            <span className="absolute left-4 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-ink-muted/40" />
          </span>
        ) : (
          <>
            {onToggleExpand && childCount > 0 ? (
              <button
                type="button"
                onClick={onToggleExpand}
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? 'Ocultar' : 'Mostrar'} subcategorías de ${category.name}`}
                className={`${adminIconButtonClass} size-7 shrink-0`}
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
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                isVisible ? 'bg-admin-accent/10 text-admin-accent' : 'bg-admin-bg text-ink-muted'
              }`}
            >
              <FolderIcon size={18} strokeWidth={1.75} />
            </span>
          </>
        )}

        <div className="min-w-0">
          <p className={`break-words text-sm md:truncate ${isChild ? 'text-ink' : 'font-semibold text-ink'}`}>
            <Highlight text={category.name} query={query} />
          </p>
          {/* En celular, el slug y el estado van bajo el nombre */}
          <div className="mt-1 flex flex-wrap items-center gap-2 md:hidden">
            <span className="break-all font-mono text-[11px] text-ink-muted">/{category.slug}</span>
            {status}
          </div>
          {hiddenByParent && (
            <p className="mt-0.5 text-xs text-amber-700">Oculta porque su categoría principal está desactivada.</p>
          )}
        </div>
      </div>

      {/* Columnas de computador */}
      <div className="hidden min-w-0 pr-4 md:block">
        <span className="block truncate rounded-md font-mono text-xs text-ink-muted">/{category.slug}</span>
      </div>
      <div className="hidden text-sm tabular-nums text-ink-muted md:block">
        {isChild ? '—' : childCount}
      </div>
      <div className="hidden md:block">{status}</div>
      <div className="hidden md:block">{reorderButtons}</div>

      {/* Acciones */}
      <div className="flex shrink-0 items-center gap-1 md:justify-end">
        <div className="md:hidden">{reorderButtons}</div>
        <AdminActionMenu label={`Acciones de ${category.name}`} items={actions} />
      </div>
    </div>
  )
}

// ─── Filas de carga ─────────────────────────────────────────
function TreeSkeleton() {
  return (
    <ul aria-label="Cargando categorías" className="divide-y divide-admin-line">
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index} className="flex animate-pulse items-center gap-3 px-5 py-4">
          <div className="size-7 rounded-lg bg-admin-bg" />
          <div className="size-10 rounded-xl bg-admin-bg" />
          <div className="h-3 w-40 rounded-full bg-admin-bg" />
          <div className="ml-auto hidden h-5 w-16 rounded-full bg-admin-bg md:block" />
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
        <li key={category.id} className={isRoot ? 'border-b border-admin-line last:border-b-0' : ''}>
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
            <ul className="border-t border-dashed border-admin-line">{renderRows(category.children, category)}</ul>
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
      <p role="alert" className="px-5 py-10 text-center text-sm text-danger">
        {error.message}
      </p>
    )
  } else if (tree.length === 0) {
    content = (
      <div className="flex flex-col items-center px-5 py-14 text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-admin-bg text-ink-muted">
          <FolderTree size={22} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="text-sm font-medium">Todavía no hay categorías</p>
        <p className="mt-1 text-sm text-ink-muted">Crea la primera para organizar tu catálogo.</p>
        <button type="button" onClick={() => openCreate(null)} className={`${adminPrimaryButtonClass} mt-5`}>
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          Nueva categoría
        </button>
      </div>
    )
  } else if (visibleTree.length === 0) {
    content = (
      <p className="px-5 py-12 text-center text-sm text-ink-muted">
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
        <div className={`hidden border-b border-admin-line px-5 ${gridCols}`}>
          <span className={`${colHeadClass} pl-[92px]`}>Categoría</span>
          <span className={colHeadClass}>Slug</span>
          <span className={colHeadClass}>Subcategorías</span>
          <span className={colHeadClass}>Estado</span>
          <span className={colHeadClass}>Orden</span>
          <span className={`${colHeadClass} text-right`}>Acción</span>
        </div>
        <ul>{renderRows(visibleTree, null)}</ul>
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
          // Secundario a propósito: crear no es la tarea principal de esta página
          <button type="button" onClick={() => openCreate(null)} className={adminSecondaryButtonClass}>
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
                <span className="text-sm font-normal text-ink-muted"> de {rootCount + childCount}</span>
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

      <AdminCard flush>
        {tree && tree.length > 0 && (
          <div className="flex flex-col gap-3 border-b border-admin-line px-4 py-4 lg:flex-row lg:items-center lg:justify-between sm:px-5">
            <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
              <AdminTabs
                label="Estado de las categorías"
                tabs={[
                  { value: 'todas', label: 'Todas', icon: LayoutGrid, count: rootCount + childCount },
                  { value: 'activas', label: 'Activas', icon: Eye, count: activeCount },
                  { value: 'inactivas', label: 'Inactivas', icon: EyeOff, count: inactiveCount },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>
            <div className="order-1 flex flex-col gap-2 sm:flex-row sm:items-center lg:order-2">
            <div className="relative w-full sm:flex-1 lg:w-72 lg:flex-none">
              <label htmlFor="category-search" className="sr-only">
                Buscar categorías
              </label>
              <Search
                size={16}
                strokeWidth={1.75}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
              />
              <input
                id="category-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o slug"
                className={`${adminInputClass} h-10 py-0 pl-9`}
              />
            </div>
            <div className="flex items-center gap-2">
              {isSearching && (
                <span className="text-xs text-ink-muted">El orden no se puede cambiar mientras filtras.</span>
              )}
              {!isSearching && (
                <button type="button" onClick={toggleAll} className={adminSecondaryButtonClass}>
                  {allExpanded ? (
                    <ChevronsDownUp size={15} strokeWidth={1.75} aria-hidden="true" />
                  ) : (
                    <ChevronsUpDown size={15} strokeWidth={1.75} aria-hidden="true" />
                  )}
                  {allExpanded ? 'Contraer todas' : 'Expandir todas'}
                </button>
              )}
            </div>
            </div>
          </div>
        )}
        {content}
      </AdminCard>



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
