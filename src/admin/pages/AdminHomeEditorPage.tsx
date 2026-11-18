import { useEffect, useState } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router'
import { useQueries } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, ExternalLink, LayoutTemplate, Pencil, Plus, Trash2 } from 'lucide-react'
import { SITE_NAME } from '../../config/site'
import { useAdminCategoryTree } from '../../features/catalog/hooks/useAdminCategoryTree'
import {
  useCreateHomeSection,
  useDeleteHomeSection,
  useHomeSections,
  useReorderHomeSection,
  useSetHomeProducts,
  useSetHomeSectionStatus,
  useUpdateHomeSection,
} from '../../features/home/hooks/useHomeAdmin'
import { getHomeItems, getHomeProducts } from '../../features/home/services/homeService'
import { homeKeys } from '../../features/home/queryKeys'
import type { HomeItemAdmin, HomeProductAdmin, HomeSectionAdmin } from '../../features/home/types'
import AdminConfirmDialog from '../components/AdminConfirmDialog'
import HomeActivateEmptyDialog from '../components/HomeActivateEmptyDialog'
import HomeBannerEditor from '../components/HomeBannerEditor'
import HomeBlockList from '../components/HomeBlockList'
import HomeLivePreview from '../components/HomeLivePreview'
import type { PreviewContent } from '../components/HomeLivePreview'
import HomeSectionFormDialog from '../components/HomeSectionFormDialog'
import type { HomeSectionDialogState, HomeSectionFormValues } from '../components/HomeSectionFormDialog'
import HomeShelfEditor from '../components/HomeShelfEditor'
import { useAdminToast } from '../toast/toastContext'
import {
  isCategoryUsable,
  MAX_BANNER_ITEMS,
  MAX_SHELF_PRODUCTS,
  sectionContentCount,
  sectionDisplayName,
  sectionPath,
  sectionTypeLabel,
  toShelfProduct,
} from '../homeSections'
import type { ShelfProduct } from '../homeSections'
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminSmallButtonClass,
} from '../adminStyles'

const byOrder = <T extends { displayOrder: number }>(list: T[]) =>
  [...list].sort((a, b) => a.displayOrder - b.displayOrder)

const sameIds = (a: ShelfProduct[], b: ShelfProduct[]) =>
  a.length === b.length && a.every((product, index) => product.productId === b[index].productId)

// Los atajos solo con las tres columnas: en pantallas chicas las flechas desplazan la página
const isWideLayout = () => window.matchMedia('(min-width: 80rem)').matches

// ¿La tecla se escribió en un campo, un menú o un diálogo? Entonces no es un atajo
const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"], [role="menu"], [role="listbox"]') !== null

const panelLabelClass = 'text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted'

// ─── La página ──────────────────────────────────────────────
function AdminHomeEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useAdminToast()

  const { data: sections, isPending, error } = useHomeSections()
  const { data: tree } = useAdminCategoryTree()

  const createSection = useCreateHomeSection()
  const updateSection = useUpdateHomeSection()
  const setStatus = useSetHomeSectionStatus()
  const reorder = useReorderHomeSection()
  const deleteSection = useDeleteHomeSection()

  const [dialog, setDialog] = useState<HomeSectionDialogState | null>(null)
  const [toDelete, setToDelete] = useState<HomeSectionAdmin | null>(null)
  const [toActivateEmpty, setToActivateEmpty] = useState<HomeSectionAdmin | null>(null)

  // ─── Bloque seleccionado: el de la URL, o el primero ──────
  const requestedId = Number(id)
  const selected = sections?.find((s) => s.id === requestedId) ?? sections?.[0]
  const selectedIndex = selected && sections ? sections.indexOf(selected) : -1
  const isBanner = selected?.type === 'Banner'

  const select = (section: HomeSectionAdmin) => {
    if (section.id !== selected?.id) navigate(sectionPath(section.id), { replace: true })
  }

  // ─── Contenido de todos los bloques, para la vista previa ─
  // Usa las mismas claves que los editores: comparten la caché
  const banners = sections?.filter((s) => s.type === 'Banner') ?? []
  const shelves = sections?.filter((s) => s.type === 'Products') ?? []

  const itemQueries = useQueries({
    queries: banners.map((section) => ({
      queryKey: homeKeys.items(section.id),
      queryFn: () => getHomeItems(section.id),
    })),
  })
  const productQueries = useQueries({
    queries: shelves.map((section) => ({
      queryKey: homeKeys.products(section.id),
      queryFn: () => getHomeProducts(section.id),
      // Al abrir la pantalla se recargan: un producto pudo dejar de verse
      refetchOnMount: 'always' as const,
    })),
  })

  const selectedItemsQuery = selected && isBanner ? itemQueries[banners.indexOf(selected)] : undefined
  const selectedProductsQuery = selected && !isBanner ? productQueries[shelves.indexOf(selected)] : undefined
  const selectedItems: HomeItemAdmin[] | undefined = selectedItemsQuery?.data && byOrder(selectedItemsQuery.data)
  const savedProducts: HomeProductAdmin[] | undefined = selectedProductsQuery?.data && byOrder(selectedProductsQuery.data)

  // ─── Productos del estante: borrador local hasta guardar ──
  const [draft, setDraft] = useState<{ sectionId: number; products: ShelfProduct[] } | null>(null)
  const saveProducts = useSetHomeProducts(selected?.id ?? 0)
  const saved = savedProducts?.map(toShelfProduct) ?? []
  const shelfDraft = draft && draft.sectionId === selected?.id ? draft.products : null
  const shelfProducts = shelfDraft ?? saved
  const isDirty = shelfDraft !== null && !sameIds(shelfDraft, saved)

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!isDirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])

  const handleSaveProducts = () => {
    // Un solo PUT con la lista completa y en orden
    saveProducts.mutate(
      shelfProducts.map((product) => product.productId),
      {
        onSuccess: () => {
          setDraft(null)
          toast({ message: 'Productos del estante guardados.' })
        },
        onError: (err) => toast({ tone: 'error', message: err.message }),
      },
    )
  }

  const preview: PreviewContent = {
    items: new Map(banners.map((s, i) => [s.id, itemQueries[i]?.data && byOrder(itemQueries[i].data)])),
    products: new Map(
      shelves.map((s, i) => {
        if (s.id === selected?.id) return [s.id, selectedProductsQuery?.data ? shelfProducts : undefined]
        const data = productQueries[i]?.data
        return [s.id, data && byOrder(data).map(toShelfProduct)]
      }),
    ),
  }

  // La lista refleja el borrador del estante elegido
  const contentCounts = new Map<number, number>()
  if (selected && !isBanner && shelfDraft) contentCounts.set(selected.id, shelfDraft.length)

  // ─── Crear y editar ───────────────────────────────────────
  const openCreate = () => {
    createSection.reset()
    setDialog({ mode: 'create' })
  }

  const openEdit = (section: HomeSectionAdmin) => {
    updateSection.reset()
    setDialog({ mode: 'edit', section })
  }

  const handleSubmit = (values: HomeSectionFormValues) => {
    if (!dialog) return
    if (dialog.mode === 'create') {
      const request =
        values.type === 'Banner' ? { type: values.type } : { type: values.type, title: values.title, categoryId: values.categoryId }
      createSection.mutate(request, {
        onSuccess: (newId) => {
          setDialog(null)
          toast({ message: 'Bloque agregado al final. Ahora agrégale contenido.' })
          navigate(sectionPath(newId), { replace: true })
        },
      })
    } else {
      // El PUT reemplaza ambos campos: siempre se reenvían los dos
      updateSection.mutate(
        { id: dialog.section.id, request: { title: values.title, categoryId: values.categoryId } },
        {
          onSuccess: () => {
            setDialog(null)
            toast({ message: 'Cambios guardados.' })
          },
        },
      )
    }
  }

  const activeSave = dialog?.mode === 'edit' ? updateSection : createSection

  // ─── Mostrar y ocultar ────────────────────────────────────
  const changeStatus = (section: HomeSectionAdmin, active: boolean, onDone?: () => void) => {
    setStatus.mutate(
      { id: section.id, active },
      {
        onSuccess: () => {
          onDone?.()
          const name = sectionDisplayName(section)
          if (active) {
            toast({ message: `"${name}" ya se ve en la página de inicio.` })
          } else {
            toast({
              message: `"${name}" se ocultó de la página de inicio.`,
              action: { label: 'Deshacer', onClick: () => changeStatus(section, true) },
            })
          }
        },
        onError: (err) => {
          if (!onDone) toast({ tone: 'error', message: err.message })
        },
      },
    )
  }

  const handleToggleStatus = (section: HomeSectionAdmin) => {
    if (setStatus.isPending) return
    if (!section.isActive && sectionContentCount(section) === 0) {
      // Se puede activar vacío, pero conviene avisar
      setStatus.reset()
      setToActivateEmpty(section)
      return
    }
    changeStatus(section, !section.isActive)
  }

  // ─── Reordenar: intercambio con el bloque de al lado ──────
  const move = (direction: -1 | 1) => {
    if (!selected || !sections || reorder.isPending) return
    const neighbor = sections[selectedIndex + direction]
    if (!neighbor) return
    reorder.mutate(
      { id: selected.id, newDisplayOrder: neighbor.displayOrder },
      { onError: (err) => toast({ tone: 'error', message: err.message }) },
    )
  }

  // ─── Borrar ───────────────────────────────────────────────
  const confirmDelete = () => {
    if (!toDelete) return
    const name = sectionDisplayName(toDelete)
    const wasSelected = toDelete.id === selected?.id
    deleteSection.mutate(toDelete.id, {
      onSuccess: () => {
        setToDelete(null)
        if (wasSelected) setDraft(null)
        toast({ message: `"${name}" se eliminó.` })
        if (wasSelected) navigate('/admin/inicio', { replace: true })
      },
    })
  }

  const deleteMessage = !toDelete
    ? ''
    : toDelete.type === 'Banner'
      ? `Se borrarán el bloque y sus ${toDelete.itemCount} medios, también de Cloudinary. No se puede deshacer.`
      : 'Se borrará el bloque con su lista de productos (los productos no se tocan). No se puede deshacer.'

  // ─── Atajos: ↑↓ elegir · Alt ↑↓ reordenar · H ocultar ─────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!sections || !selected || e.ctrlKey || e.metaKey || e.defaultPrevented) return
      if (!isWideLayout() || isTypingTarget(e.target)) return

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const direction = e.key === 'ArrowUp' ? -1 : 1
        if (e.altKey) return move(direction)
        const next = sections[selectedIndex + direction]
        if (next) select(next)
      } else if (e.key.toLowerCase() === 'h' && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        handleToggleStatus(selected)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // ─── Resumen ──────────────────────────────────────────────
  const publishedCount = sections?.filter((s) => s.isActive && sectionContentCount(s) > 0).length ?? 0
  const summary =
    sections && sections.length > 0
      ? `${sections.length} ${sections.length === 1 ? 'bloque' : 'bloques'}, de arriba hacia abajo · ${publishedCount} se ${
          publishedCount === 1 ? 've' : 'ven'
        } en la tienda`
      : 'Los bloques que ven los clientes al entrar a la tienda'

  // ─── Panel derecho: el bloque elegido ─────────────────────
  let panel = null
  if (selected && sections) {
    const name = sectionDisplayName(selected)
    const count = isBanner ? (selectedItems?.length ?? selected.itemCount) : shelfProducts.length
    const max = isBanner ? MAX_BANNER_ITEMS : MAX_SHELF_PRODUCTS
    const contentQuery = isBanner ? selectedItemsQuery : selectedProductsQuery
    const viewAllInactive = selected.categoryId !== null && !isCategoryUsable(tree, selected.categoryId)

    const status = !selected.isActive
      ? { dot: 'bg-ink/25', text: 'Oculto: no se ve en la tienda' }
      : count === 0
        ? { dot: 'bg-amber-500', text: 'Activo, pero vacío: la tienda no lo muestra' }
        : { dot: 'bg-admin-success', text: 'Publicado: se ve en la página de inicio' }

    panel = (
      <>
        <div className="space-y-1 border-b border-admin-line px-5 py-4">
          <p className="text-xs text-ink-muted">
            {sectionTypeLabel(selected)} · posición {selectedIndex + 1} de {sections.length}
          </p>
          <h2 className={`break-words text-lg font-semibold ${!isBanner && !selected.title ? 'italic text-ink-muted' : ''}`}>
            {name}
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${status.dot}`} />
            {setStatus.isPending && setStatus.variables?.id === selected.id ? 'Guardando…' : status.text}
          </p>
        </div>

        <div className="flex-1 space-y-6 overflow-auto px-5 py-4">
          {!isBanner && (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className={panelLabelClass}>Encabezado</h3>
                <button type="button" onClick={() => openEdit(selected)} className={`${adminSmallButtonClass} h-7`}>
                  <Pencil size={13} strokeWidth={1.75} aria-hidden="true" />
                  Editar
                </button>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div className="min-w-0">
                  <dt className="text-ink-muted">Título</dt>
                  <dd className={`mt-0.5 break-words text-[13px] font-medium ${selected.title ? '' : 'italic text-ink-muted'}`}>
                    {selected.title ?? 'Sin título'}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-ink-muted">“Ver todo” lleva a</dt>
                  <dd className={`mt-0.5 text-[13px] font-medium ${selected.categoryName ? '' : 'italic text-ink-muted'}`}>
                    {selected.categoryName ?? 'Sin botón'}
                  </dd>
                  {viewAllInactive && (
                    <dd className="mt-0.5 text-[11px] text-amber-700">Categoría inactiva: el botón no se mostrará.</dd>
                  )}
                </div>
              </dl>
            </section>
          )}

          <section className="space-y-2.5">
            <h3 className={panelLabelClass}>
              {isBanner ? 'Medios' : 'Productos'} · {count} de {max}
            </h3>
            {!contentQuery || contentQuery.isPending ? (
              <div className="animate-pulse space-y-2">
                <div className="h-16 rounded-lg bg-admin-bg" />
                <div className="h-16 rounded-lg bg-admin-bg" />
              </div>
            ) : contentQuery.error ? (
              <p role="alert" className="text-sm text-danger">
                {contentQuery.error.message}
              </p>
            ) : isBanner ? (
              <HomeBannerEditor key={selected.id} sectionId={selected.id} items={selectedItems ?? []} tree={tree ?? []} />
            ) : (
              <HomeShelfEditor
                key={selected.id}
                products={shelfProducts}
                onChange={(products) => setDraft({ sectionId: selected.id, products })}
                isSaving={saveProducts.isPending}
              />
            )}
          </section>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-admin-line px-5 py-3">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={selectedIndex === 0 || reorder.isPending}
            className={adminSmallButtonClass}
          >
            <ArrowUp size={14} strokeWidth={1.75} aria-hidden="true" />
            Subir
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={selectedIndex === sections.length - 1 || reorder.isPending}
            className={adminSmallButtonClass}
          >
            <ArrowDown size={14} strokeWidth={1.75} aria-hidden="true" />
            Bajar
          </button>
          <button
            type="button"
            onClick={() => {
              deleteSection.reset()
              setToDelete(selected)
            }}
            className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-danger transition-colors hover:bg-red-50"
          >
            <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
            Eliminar
          </button>
        </div>
      </>
    )
  }

  // ─── Contenido según el estado de la carga ────────────────
  let body
  if (isPending) {
    body = (
      <div aria-label="Cargando bloques" className="grid flex-1 animate-pulse gap-4 p-4 xl:grid-cols-[300px_1fr_360px] xl:p-0">
        <div className="h-64 rounded-xl bg-white xl:h-full xl:rounded-none" />
        <div className="hidden p-6 xl:block">
          <div className="h-full rounded-xl bg-white" />
        </div>
        <div className="h-64 rounded-xl bg-white xl:h-full xl:rounded-none" />
      </div>
    )
  } else if (error) {
    body = (
      <p role="alert" className="px-5 py-10 text-center text-sm text-danger">
        {error.message}
      </p>
    )
  } else if (sections.length === 0) {
    body = (
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-white text-ink-muted ring-1 ring-admin-line">
          <LayoutTemplate size={22} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="text-sm font-medium">La página de inicio está vacía</p>
        <p className="mt-1 max-w-sm text-sm text-ink-muted">
          Agrega banners y estantes de productos, en el orden que quieras. La tienda muestra un mensaje genérico
          mientras tanto.
        </p>
        <button type="button" onClick={openCreate} className={`${adminPrimaryButtonClass} mt-5`}>
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          Agregar bloque
        </button>
      </div>
    )
  } else {
    body = (
      // Celular y tablet: una columna (lista, editor, vista previa).
      // Pantallas grandes: tres columnas, cada una con su propio scroll
      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(320px,380px)]">
        <aside
          aria-label="Bloques de la página"
          className="flex max-h-[60vh] min-h-0 flex-col border-b border-admin-line bg-white xl:max-h-none xl:border-b-0 xl:border-r"
        >
          <HomeBlockList
            sections={sections}
            selectedId={selected?.id}
            tree={tree}
            updatingId={setStatus.isPending ? setStatus.variables?.id : undefined}
            contentCounts={contentCounts}
            onSelect={select}
            onToggleStatus={handleToggleStatus}
            onAdd={openCreate}
          />
        </aside>

        <section
          aria-label="Vista previa"
          className="order-3 min-h-0 min-w-0 overflow-auto p-4 md:p-6 xl:order-none"
        >
          <HomeLivePreview
            sections={sections}
            selectedId={selected?.id}
            content={preview}
            tree={tree ?? []}
            onSelect={select}
          />
        </section>

        <section
          aria-label="Editar bloque"
          className="order-2 flex min-h-0 flex-col border-b border-admin-line bg-white xl:order-none xl:border-b-0 xl:border-l"
        >
          {panel}
        </section>
      </div>
    )
  }

  return (
    <>
      <title>{`Página de inicio | Admin ${SITE_NAME}`}</title>

      {/* Alto de la pantalla menos la barra superior del panel (h-16) */}
      <div className="flex flex-col xl:h-[calc(100dvh-4rem)]">
        <header className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-admin-line bg-white px-4 py-3 md:px-5 xl:h-14 xl:flex-nowrap xl:py-0">
          <div className="flex min-w-0 flex-1 basis-full flex-col gap-x-2.5 sm:basis-auto xl:flex-row xl:items-baseline">
            <h1 className="whitespace-nowrap text-base font-semibold text-ink">Página de inicio</h1>
            <p className="truncate text-[13px] text-ink-muted">{summary}</p>
          </div>

          <p className="flex items-center gap-2 whitespace-nowrap text-[13px] text-ink-muted" role="status">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${isDirty ? 'bg-amber-500' : 'bg-admin-success'}`}
            />
            {isDirty ? 'Cambios sin guardar en el estante' : 'Todo guardado'}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer" className={`${adminSecondaryButtonClass} h-[34px] py-0 text-[13px]`}>
              Ver en la tienda
              <ExternalLink size={14} strokeWidth={1.75} aria-hidden="true" />
            </a>
            {/* Siempre en su lugar para no mover la barra: se activan con cambios en un estante */}
            <button
              type="button"
              onClick={() => setDraft(null)}
              disabled={!isDirty || saveProducts.isPending}
              className={`${adminSecondaryButtonClass} h-[34px] py-0 text-[13px]`}
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={handleSaveProducts}
              disabled={!isDirty || saveProducts.isPending}
              className={`${adminPrimaryButtonClass} h-[34px] py-0 text-[13px]`}
            >
              {saveProducts.isPending ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </header>

        {body}
      </div>

      <HomeSectionFormDialog
        state={dialog}
        tree={tree ?? []}
        isSaving={activeSave.isPending}
        serverError={activeSave.error?.message ?? null}
        onSubmit={handleSubmit}
        onClose={() => setDialog(null)}
      />

      <AdminConfirmDialog
        isOpen={toDelete !== null}
        title={`¿Eliminar "${toDelete ? sectionDisplayName(toDelete) : ''}"?`}
        message={deleteMessage}
        confirmLabel="Eliminar"
        loadingLabel="Eliminando..."
        isLoading={deleteSection.isPending}
        error={deleteSection.error?.message ?? null}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />

      <HomeActivateEmptyDialog
        section={toActivateEmpty}
        isLoading={setStatus.isPending}
        error={setStatus.error?.message ?? null}
        onConfirm={() => toActivateEmpty && changeStatus(toActivateEmpty, true, () => setToActivateEmpty(null))}
        onCancel={() => setToActivateEmpty(null)}
        showContentLink={false}
      />

      <AdminConfirmDialog
        isOpen={blocker.state === 'blocked'}
        title="¿Salir sin guardar?"
        message="Tienes cambios en los productos del estante que se perderán."
        confirmLabel="Salir sin guardar"
        loadingLabel="Saliendo..."
        isLoading={false}
        error={null}
        onConfirm={() => {
          setDraft(null)
          blocker.proceed?.()
        }}
        onCancel={() => blocker.reset?.()}
      />
    </>
  )
}

export default AdminHomeEditorPage
