import { useEffect, useState } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router'
import { useQueries } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, CloudOff, ExternalLink, LayoutTemplate, Monitor, Pencil, Plus, Smartphone, Trash2 } from 'lucide-react'
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
import DevicePreviewFrame from '../components/DevicePreviewFrame'
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
  adminCountChipClass,
  adminGhostButtonClass,
  adminOutlineButtonClass,
  adminPanelClass,
  adminSolidButtonClass,
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

type PreviewDevice = 'desktop' | 'mobile'
const PREVIEW_DEVICE_KEY = 'admin:inicio-vista-previa'
const MOBILE_PREVIEW_WIDTH = 390 // Ancho típico de un celular

// Recuerda la última vista elegida (computador o celular)
function readPreviewDevice(): PreviewDevice {
  try {
    return localStorage.getItem(PREVIEW_DEVICE_KEY) === 'mobile' ? 'mobile' : 'desktop'
  } catch {
    return 'desktop'
  }
}

const panelLabelClass = 'text-[13px] font-semibold text-admin-ink'

// Columnas laterales: en pantallas grandes quedan fijas al hacer scroll, con su propio scroll interno
const stickyColumnClass = 'xl:sticky xl:top-[84px] xl:max-h-[calc(100dvh-104px)]'

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
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>(readPreviewDevice)

  const changePreviewDevice = (device: PreviewDevice) => {
    setPreviewDevice(device)
    try {
      localStorage.setItem(PREVIEW_DEVICE_KEY, device)
    } catch {
      // Sin almacenamiento: solo dura esta visita
    }
  }

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
      ? { dot: 'bg-[#b5b4ae]', ink: 'text-[#6b6a65]', text: 'Oculto: no se ve en la tienda' }
      : count === 0
        ? { dot: 'bg-[#e3a008]', ink: 'text-[#8a5a00]', text: 'Activo, pero vacío: la tienda no lo muestra' }
        : { dot: 'bg-[#2f9e5b]', ink: 'text-[#1f7a45]', text: 'Publicado: se ve en la página de inicio' }

    panel = (
      <>
        <div className="space-y-1 border-b border-admin-row-line px-5 py-4">
          <p className="text-xs text-[#8b8a84]">
            {sectionTypeLabel(selected)} · posición {selectedIndex + 1} de {sections.length}
          </p>
          <h2 className={`break-words text-[17px] font-semibold tracking-tight ${!isBanner && !selected.title ? 'italic text-[#8b8a84]' : ''}`}>
            {name}
          </h2>
          <p className={`flex items-center gap-1.5 text-[13px] font-medium ${status.ink}`}>
            <span aria-hidden="true" className={`size-[7px] shrink-0 rounded-full ${status.dot}`} />
            {setStatus.isPending && setStatus.variables?.id === selected.id ? 'Guardando…' : status.text}
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-auto px-5 py-4">
          {!isBanner && (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className={panelLabelClass}>Encabezado</h3>
                <button type="button" onClick={() => openEdit(selected)} className={adminOutlineButtonClass}>
                  <Pencil size={13} strokeWidth={1.75} aria-hidden="true" />
                  Editar
                </button>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div className="min-w-0">
                  <dt className="text-[#8b8a84]">Título</dt>
                  <dd className={`mt-0.5 break-words text-[13px] font-medium ${selected.title ? '' : 'italic text-[#8b8a84]'}`}>
                    {selected.title ?? 'Sin título'}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[#8b8a84]">“Ver todo” lleva a</dt>
                  <dd className={`mt-0.5 text-[13px] font-medium ${selected.categoryName ? '' : 'italic text-[#8b8a84]'}`}>
                    {selected.categoryName ?? 'Sin botón'}
                  </dd>
                  {viewAllInactive && (
                    <dd className="mt-0.5 text-[11px] font-medium text-[#8a5a00]">Categoría inactiva: el botón no se mostrará.</dd>
                  )}
                </div>
              </dl>
            </section>
          )}

          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <h3 className={panelLabelClass}>{isBanner ? 'Medios' : 'Productos'}</h3>
              <span className={adminCountChipClass}>
                {count} de {max}
              </span>
            </div>
            {!contentQuery || contentQuery.isPending ? (
              <div className="animate-pulse space-y-2">
                <div className="h-16 rounded-[10px] bg-admin-active" />
                <div className="h-16 rounded-[10px] bg-[#f3f2ee]" />
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

        <div className="flex flex-wrap items-center gap-2 border-t border-admin-row-line px-5 py-3">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={selectedIndex === 0 || reorder.isPending}
            className={adminOutlineButtonClass}
          >
            <ArrowUp size={14} strokeWidth={1.75} aria-hidden="true" />
            Subir
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={selectedIndex === sections.length - 1 || reorder.isPending}
            className={adminOutlineButtonClass}
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
            className={`${adminGhostButtonClass} ml-auto text-[#b42318]! hover:bg-[#fdecea]!`}
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
      <div aria-label="Cargando bloques" className="grid animate-pulse gap-5 xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(320px,380px)]">
        <div className={`${adminPanelClass} h-80`} />
        <div className={`${adminPanelClass} hidden h-[520px] xl:block`} />
        <div className={`${adminPanelClass} h-80`} />
      </div>
    )
  } else if (error) {
    body = (
      <section role="alert" className={`${adminPanelClass} flex flex-col items-center gap-2 px-6 py-14 text-center`}>
        <span className="flex size-11 items-center justify-center rounded-full bg-[#fdecea] text-[#b42318]">
          <CloudOff size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <p className="mt-1 text-[15px] font-semibold">No pudimos cargar la página de inicio</p>
        <p className="max-w-[340px] text-sm text-[#6b6a65]">{error.message}</p>
      </section>
    )
  } else if (sections.length === 0) {
    body = (
      <section className={`${adminPanelClass} flex flex-col items-center gap-2 px-6 pb-[68px] pt-16 text-center`}>
        <span className="flex size-[52px] items-center justify-center rounded-[14px] bg-admin-hover text-[#4a4945]">
          <LayoutTemplate size={24} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="mt-1.5 text-base font-semibold">La página de inicio está vacía</p>
        <p className="max-w-[380px] text-sm text-[#6b6a65]">
          Agrega banners y estantes de productos, en el orden que quieras. La tienda muestra un mensaje genérico
          mientras tanto.
        </p>
        <button type="button" onClick={openCreate} className={`${adminSolidButtonClass} mt-2.5`}>
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          Agregar bloque
        </button>
      </section>
    )
  } else {
    body = (
      // Celular y tablet: una columna (lista, editor, vista previa).
      // Pantallas grandes: tres columnas, cada una con su propio scroll
      <div className="grid grid-cols-1 gap-3.5 md:gap-5 xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(320px,380px)] xl:items-start">
        <aside
          aria-label="Bloques de la página"
          className={`${adminPanelClass} flex max-h-[60vh] min-h-0 flex-col overflow-hidden ${stickyColumnClass}`}
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
          className={`${adminPanelClass} order-3 min-w-0 overflow-hidden xl:order-none`}
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 border-b border-admin-row-line px-5 py-3 text-[13px]">
            <h2 className="font-semibold text-admin-ink">Vista previa</h2>
            <span className="text-[#8b8a84]">· toca un bloque para editarlo</span>
            {/* Computador o celular: la de celular se dibuja en un iframe del ancho de un teléfono */}
            <div
              role="radiogroup"
              aria-label="Ver como"
              className="ml-auto inline-flex gap-0.5 rounded-[10px] bg-admin-active p-[3px]"
            >
              {(
                [
                  { value: 'desktop', label: 'Computador', icon: Monitor },
                  { value: 'mobile', label: 'Celular', icon: Smartphone },
                ] as const
              ).map(({ value, label, icon: Icon }) => {
                const isActive = previewDevice === value
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => changePreviewDevice(value)}
                    className={`inline-flex h-[30px] items-center gap-1.5 rounded-[7px] px-2.5 text-[13px] font-medium transition-colors ${
                      isActive ? 'bg-white text-admin-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)]' : 'text-[#6b6a65] hover:text-admin-ink'
                    }`}
                  >
                    <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
          {previewDevice === 'desktop' ? (
            <div className="overflow-auto">
              <HomeLivePreview
                sections={sections}
                selectedId={selected?.id}
                content={preview}
                tree={tree ?? []}
                onSelect={select}
              />
            </div>
          ) : (
            <div className="flex justify-center bg-admin-bg px-4 py-6">
              {/* Marco de teléfono */}
              <div className="max-w-full rounded-[28px] border border-admin-line bg-white p-2.5 shadow-[0_8px_24px_rgb(28_28_26/0.08)]">
                <DevicePreviewFrame width={MOBILE_PREVIEW_WIDTH} title="Vista previa en celular">
                  <HomeLivePreview
                    sections={sections}
                    selectedId={selected?.id}
                    content={preview}
                    tree={tree ?? []}
                    onSelect={select}
                  />
                </DevicePreviewFrame>
              </div>
            </div>
          )}
        </section>

        <section
          aria-label="Editar bloque"
          className={`${adminPanelClass} order-2 flex min-h-0 flex-col overflow-hidden xl:order-none ${stickyColumnClass}`}
        >
          {panel}
        </section>
      </div>
    )
  }

  return (
    <>
      <title>{`Página de inicio | Admin ${SITE_NAME}`}</title>

      <div className="flex flex-col">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-admin-ink">Página de inicio</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#6b6a65]">
              <span>{summary}</span>
              <span role="status" className={`inline-flex items-center gap-1.5 font-medium ${isDirty ? 'text-[#8a5a00]' : 'text-[#1f7a45]'}`}>
                <span aria-hidden="true" className={`size-[7px] rounded-full ${isDirty ? 'bg-[#e3a008]' : 'bg-[#2f9e5b]'}`} />
                {isDirty ? 'Cambios sin guardar en el estante' : 'Todo guardado'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer" className={`${adminOutlineButtonClass} rounded-[9px] text-sm`}>
              <ExternalLink size={15} strokeWidth={1.75} aria-hidden="true" />
              Ver en la tienda
            </a>
            {/* Siempre en su lugar para no mover la barra: se activan con cambios en un estante */}
            <button
              type="button"
              onClick={() => setDraft(null)}
              disabled={!isDirty || saveProducts.isPending}
              className={`${adminGhostButtonClass} text-sm`}
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={handleSaveProducts}
              disabled={!isDirty || saveProducts.isPending}
              className={adminSolidButtonClass}
            >
              {saveProducts.isPending ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>

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
