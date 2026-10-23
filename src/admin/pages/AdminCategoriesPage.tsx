import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronRight, FolderPlus, Pencil, Plus } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog'
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
import StatusBadge from '../components/StatusBadge'
import CategoryFormDialog from '../components/CategoryFormDialog'
import type { CategoryDialogState, CategoryFormValues } from '../components/CategoryFormDialog'
import { adminPrimaryButtonClass, adminSecondaryButtonClass } from '../adminStyles'
import { ExternalLink } from 'lucide-react'
import StoreNavPreview from '../components/StoreNavPreview'

// ─── Botón de ícono para las acciones de cada fila ──────────
interface IconActionProps {
  label: string
  onClick: () => void
  disabled?: boolean
  hidden?: boolean
  children: ReactNode
}

function IconAction({ label, onClick, disabled = false, hidden = false, children }: IconActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || hidden}
      aria-label={label}
      title={label}
      // invisible: no se ve, pero conserva su espacio para que las filas queden alineadas
      className={`rounded-md p-1.5 text-ink-muted hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 ${
        hidden ? 'invisible' : ''
      }`}
    >
      {children}
    </button>
  )
}

// ─── Una fila del árbol ─────────────────────────────────────
interface CategoryRowProps {
  category: AdminCategoryNode
  isChild: boolean
  hiddenByParent: boolean
  isExpanded: boolean
  onToggleExpand?: () => void
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  isReordering: boolean
  onEdit: () => void
  onAddChild?: () => void
  onToggleStatus: () => void
  isUpdating: boolean
}

function CategoryRow({
  category,
  isChild,
  hiddenByParent,
  isExpanded,
  onToggleExpand,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  isReordering,
  onEdit,
  onAddChild,
  onToggleStatus,
  isUpdating,
}: CategoryRowProps) {
  const childCount = category.children.length
  const iconSize = 16
  const isVisible = category.isActive && !hiddenByParent

  return (
    <div className={`flex items-start gap-2 py-3 md:items-center md:gap-3 ${isChild ? 'pl-6 md:pl-10' : ''}`}>
      {onToggleExpand && childCount > 0 ? (
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Ocultar' : 'Mostrar'} subcategorías de ${category.name}`}
          className="shrink-0 rounded-md p-1 text-ink-muted hover:bg-canvas hover:text-ink"
        >
          <ChevronRight
            size={18}
            strokeWidth={1.5}
            aria-hidden="true"
            className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </button>
      ) : (
        !isChild && <span aria-hidden="true" className="w-[26px] shrink-0" />
      )}

      {/* Celular: dos líneas (nombre arriba, acciones abajo) · Computador: una sola fila */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <div className={`min-w-0 md:flex-1 ${isVisible ? '' : 'opacity-60'}`}>
          <p className={`break-words text-sm md:truncate ${isChild ? '' : 'font-semibold'}`}>
            {category.name}
          </p>
          <p className="flex flex-wrap gap-x-3 text-xs text-ink-muted">
            <span className="break-all md:truncate">/{category.slug}</span>
            {!isChild && (
              <span>
                {childCount} {childCount === 1 ? 'subcategoría' : 'subcategorías'}
              </span>
            )}
          </p>
          {hiddenByParent && (
            <p className="text-xs text-ink-muted">
              Oculta porque su categoría principal está desactivada.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!category.isActive ? (
            <StatusBadge tone="neutral">Inactiva</StatusBadge>
          ) : hiddenByParent ? (
            <StatusBadge tone="warning">Oculta</StatusBadge>
          ) : (
            <StatusBadge tone="success">Activa</StatusBadge>
          )}

          <div className="flex items-center gap-0.5">
            <IconAction
              label={`Subir ${category.name}`}
              onClick={onMoveUp}
              hidden={isFirst}
              disabled={isReordering}
            >
              <ArrowUp size={iconSize} strokeWidth={1.5} aria-hidden="true" />
            </IconAction>
            <IconAction
              label={`Bajar ${category.name}`}
              onClick={onMoveDown}
              hidden={isLast}
              disabled={isReordering}
            >
              <ArrowDown size={iconSize} strokeWidth={1.5} aria-hidden="true" />
            </IconAction>
            <IconAction label={`Editar ${category.name}`} onClick={onEdit}>
              <Pencil size={iconSize} strokeWidth={1.5} aria-hidden="true" />
            </IconAction>
            {onAddChild && (
              <IconAction label={`Agregar subcategoría a ${category.name}`} onClick={onAddChild}>
                <FolderPlus size={iconSize} strokeWidth={1.5} aria-hidden="true" />
              </IconAction>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleStatus}
            disabled={isUpdating}
            className={`${adminSecondaryButtonClass} w-24`}
          >
            {isUpdating ? 'Guardando...' : category.isActive ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── La página ──────────────────────────────────────────────
function AdminCategoriesPage() {
  const { data: tree, isPending, error } = useAdminCategoryTree()
  const setStatus = useSetCategoryStatus()
  const reorder = useReorderCategory()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const [expanded, setExpanded] = useState<Set<number>>(() => new Set())
  const [toDeactivate, setToDeactivate] = useState<AdminCategoryNode | null>(null)
  const [dialog, setDialog] = useState<CategoryDialogState | null>(null)

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
      setStatus.mutate({ id: category.id, active: true })
    }
  }

  const confirmDeactivate = () => {
    if (!toDeactivate) return
    setStatus.mutate(
      { id: toDeactivate.id, active: false },
      { onSuccess: () => setToDeactivate(null) },
    )
  }

  const isUpdating = (id: number) => setStatus.isPending && setStatus.variables?.id === id

  // ─── Reordenar: toma el orden de la hermana de al lado ────
  const moveTo = (category: AdminCategoryNode, sibling: AdminCategoryNode) => {
    reorder.mutate({ id: category.id, newDisplayOrder: sibling.displayOrder })
  }

  // ─── Crear y editar ───────────────────────────────────────
  const openCreate = (parent: AdminCategoryNode | null) => {
    createCategory.reset()
    setDialog({ mode: 'create', parent })
  }

  const openEdit = (category: AdminCategoryNode) => {
    updateCategory.reset()
    setDialog({ mode: 'edit', category })
  }

  const closeDialog = () => setDialog(null)

  const handleSubmitCategory = (values: CategoryFormValues) => {
    if (!dialog) return

    if (dialog.mode === 'create') {
      createCategory.mutate(
        { name: values.name, slug: values.slug, parentCategoryId: values.parentId },
        { onSuccess: closeDialog },
      )
    } else {
      updateCategory.mutate(
        { id: dialog.category.id, request: { name: values.name, slug: values.slug } },
        { onSuccess: closeDialog },
      )
    }
  }

  const activeSave = dialog?.mode === 'edit' ? updateCategory : createCategory

  // ─── Las filas de un nivel (principales o hijas de una) ───
  const renderRows = (siblings: AdminCategoryNode[], parent: AdminCategoryNode | null) =>
    siblings.map((category, index) => {
      const isRoot = parent === null
      const isExpanded = expanded.has(category.id)

      return (
        <li
          key={category.id}
          className={isRoot ? 'border-b border-line last:border-b-0' : 'border-b border-line/60 last:border-b-0'}
        >
          <CategoryRow
            category={category}
            isChild={!isRoot}
            hiddenByParent={parent !== null && !parent.isActive && category.isActive}
            isExpanded={isExpanded}
            onToggleExpand={isRoot ? () => toggleExpand(category.id) : undefined}
            isFirst={index === 0}
            isLast={index === siblings.length - 1}
            onMoveUp={() => moveTo(category, siblings[index - 1])}
            onMoveDown={() => moveTo(category, siblings[index + 1])}
            isReordering={reorder.isPending}
            onEdit={() => openEdit(category)}
            onAddChild={isRoot ? () => openCreate(category) : undefined}
            onToggleStatus={() => handleToggleStatus(category)}
            isUpdating={isUpdating(category.id)}
          />

          {isRoot && isExpanded && category.children.length > 0 && (
            <ul className="border-t border-line/60">{renderRows(category.children, category)}</ul>
          )}
        </li>
      )
    })

  // ─── Contenido según el estado ────────────────────────────
  let content
  if (isPending) {
    content = <p className="text-sm text-ink-muted">Cargando categorías...</p>
  } else if (error) {
    content = <p className="text-sm text-danger">{error.message}</p>
  } else if (tree.length === 0) {
    content = <p className="text-sm text-ink-muted">Todavía no hay categorías.</p>
  } else {
    content = <ul>{renderRows(tree, null)}</ul>
  }

  const deactivateMessage =
    toDeactivate && toDeactivate.children.length > 0
      ? `Dejará de verse en la tienda, y sus ${toDeactivate.children.length} subcategorías quedarán ocultas. Al reactivarla, todo volverá como estaba.`
      : 'Dejará de verse en la tienda. Podrás activarla de nuevo cuando quieras.'

  // Error visible fuera de los diálogos (activar o reordenar)
  const pageError = (!toDeactivate && setStatus.error) || reorder.error

  return (
    <>
      <title>{`Categorías | Admin ${SITE_NAME}`}</title>

      <AdminPageHeader
        title="Categorías"
        description={tree ? `${tree.length} categorías principales` : undefined}
        actions={
          <button type="button" onClick={() => openCreate(null)} className={adminPrimaryButtonClass}>
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            Nueva categoría
          </button>
        }
      />

      {pageError && (
        <p role="alert" className="mb-4 text-sm text-danger">
          {pageError.message}
        </p>
      )}

      {tree && tree.length > 0 && (
        <AdminCard
          title="Vista previa en la tienda"
          className="mb-4"
          actions={
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink hover:underline"
            >
              Abrir la tienda
              <ExternalLink size={14} strokeWidth={1.5} aria-hidden="true" />
            </a>
          }
        >
          <p className="mb-3 text-xs text-ink-muted">
            Así ven los clientes el menú. Se actualiza con cada cambio. Toca una categoría para ver sus
            subcategorías.
          </p>
          <StoreNavPreview tree={tree} />
        </AdminCard>
      )}

      <AdminCard
        actions={
          tree && tree.length > 0 ? (
            <button type="button" onClick={toggleAll} className={adminSecondaryButtonClass}>
              {allExpanded ? 'Contraer todas' : 'Expandir todas'}
            </button>
          ) : undefined
        }
      >
        {content}
      </AdminCard>

      <ConfirmDialog
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