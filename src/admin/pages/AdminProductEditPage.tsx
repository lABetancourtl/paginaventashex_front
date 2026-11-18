import { useCallback, useEffect, useState } from 'react'
import { Link, useBlocker, useLocation, useParams } from 'react-router'
import { Check, Circle, ExternalLink, ImageOff, PackageX, PartyPopper, X } from 'lucide-react'
import { ApiRequestError } from '../../api/client'
import { SITE_NAME } from '../../config/site'
import { cloudinaryUrl } from '../../utils/cloudinary'
import { formatCOP } from '../../utils/formatters'
import { useAdminCategoryTree } from '../../features/catalog/hooks/useAdminCategoryTree'
import { useAdminProduct } from '../../features/catalog/hooks/useAdminProduct'
import {
  useRemoveProductDiscount,
  useSetProductDiscount,
  useSetProductStatus,
  useUpdateProduct,
} from '../../features/catalog/hooks/useProductMutations'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminCard from '../components/AdminCard'
import AdminConfirmDialog from '../components/AdminConfirmDialog'
import ProductForm from '../components/ProductForm'
import ProductDiscountForm from '../components/ProductDiscountForm'
import StatusBadge from '../components/StatusBadge'
import { toProductFormValues, toUpdateProductRequest } from '../productForm'
import type { ProductFormValues } from '../productForm'
import { adminPrimaryButtonClass, adminSecondaryButtonClass } from '../adminStyles'
import AdminSwitch from '../components/AdminSwitch'
import { useAdminToast } from '../toast/toastContext'
import ProductMediaManager from '../components/ProductMediaManager'
import ProductVariantsManager from '../components/ProductVariantsManager'

const breadcrumbsBase = [{ label: 'Productos', to: '/admin/productos' }]

const FORM_ID = 'product-edit-form'

// Secciones de la página, para el índice y los enlaces del resumen
const sections = [
  { id: 'informacion', label: 'Información' },
  { id: 'variantes', label: 'Variantes' },
  { id: 'imagenes', label: 'Imágenes y video' },
] as const

const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

interface ReadinessItem {
  label: string
  done: boolean
  section: string
}

// Lo que necesita el producto para venderse bien
function ReadinessChecklist({ items }: { items: ReadinessItem[] }) {
  const doneCount = items.filter((item) => item.done).length
  return (
    <div className="mt-4 rounded-xl border border-admin-line p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ink">Listo para vender</p>
        <span className="text-[11px] font-medium tabular-nums text-ink-muted">
          {doneCount} de {items.length}
        </span>
      </div>
      <div
        className="mb-3 h-1.5 overflow-hidden rounded-full bg-admin-bg"
        role="progressbar"
        aria-label="Progreso para vender"
        aria-valuenow={doneCount}
        aria-valuemin={0}
        aria-valuemax={items.length}
      >
        <div
          className={`h-full rounded-full transition-[width] ${doneCount === items.length ? 'bg-admin-success' : 'bg-amber-400'}`}
          style={{ width: `${(doneCount / items.length) * 100}%` }}
        />
      </div>
      <ul className="space-y-1.5">
        {items.map(({ label, done, section }) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => scrollToSection(section)}
              className="flex w-full items-center gap-2 rounded-md text-left text-xs hover:text-admin-accent"
            >
              {done ? (
                <span className="flex size-4 items-center justify-center rounded-full bg-admin-success text-white">
                  <Check size={11} strokeWidth={3} aria-hidden="true" />
                </span>
              ) : (
                <Circle size={16} strokeWidth={1.75} aria-hidden="true" className="text-amber-500" />
              )}
              <span className={done ? 'text-ink-muted line-through decoration-ink-muted/40' : 'font-medium text-ink'}>
                {label}
              </span>
              <span className="sr-only">{done ? '(listo)' : '(pendiente)'}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AdminProductEditPage() {
  const { id } = useParams()
  const productId = Number(id)
  const isValidId = Number.isInteger(productId) && productId > 0
  const location = useLocation()

  const product = useAdminProduct(productId, isValidId)
  const categories = useAdminCategoryTree()
  const updateProduct = useUpdateProduct()
  const setStatus = useSetProductStatus()
  const setDiscount = useSetProductDiscount()
  const removeDiscount = useRemoveProductDiscount()

  // Aviso de "producto creado", recibido desde la página de crear
  const justCreated = (location.state as { created?: boolean } | null)?.created === true
  const [showCreatedNotice, setShowCreatedNotice] = useState(justCreated)
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const toast = useAdminToast()

  // ─── Cambios sin guardar ──────────────────────────────────
  const [isDirty, setIsDirty] = useState(false)
  const [formKey, setFormKey] = useState(0) // Al cambiarla, el formulario vuelve a los datos guardados
  const handleDirtyChange = useCallback((dirty: boolean) => setIsDirty(dirty), [])

  // Si sale del panel con cambios, se le pregunta antes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname,
  )

  // Y si cierra o recarga la pestaña, el navegador muestra su aviso
  useEffect(() => {
    if (!isDirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])

  if (!isValidId || (product.error instanceof ApiRequestError && product.error.status === 404)) {
    return (
      <>
        <AdminPageHeader title="Producto no encontrado" breadcrumbs={breadcrumbsBase} />
        <AdminCard>
          <div className="flex flex-col items-center py-8 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-admin-bg text-ink-muted">
              <PackageX size={22} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <p className="text-sm text-ink-muted">Puede que el enlace esté mal o que el producto ya no exista.</p>
            <Link to="/admin/productos" className={`${adminSecondaryButtonClass} mt-5`}>
              Volver a productos
            </Link>
          </div>
        </AdminCard>
      </>
    )
  }

  if (product.isPending) {
    return (
      <div aria-label="Cargando producto" className="animate-pulse space-y-4">
        <div className="h-8 w-64 rounded-lg bg-white" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-96 rounded-2xl bg-white lg:col-span-2" />
          <div className="h-64 rounded-2xl bg-white" />
        </div>
      </div>
    )
  }
  if (product.error) return <p className="text-sm text-danger">{product.error.message}</p>

  const item = product.data
  const imageCount = item.media.filter((media) => media.mediaType === 'Image').length
  const activeVariants = item.variants.filter((variant) => variant.isActive)
  const totalStock = activeVariants.reduce((sum, variant) => sum + variant.stock, 0)
  const hasDiscount = item.discountPercent !== null && item.discountPercent > 0

  const categoryIsActive =
    categories.data?.some(
      (root) => root.isActive && root.children.some((child) => child.id === item.categoryId && child.isActive),
    ) ?? true
  const readiness: ReadinessItem[] = [
    { label: 'Al menos una imagen', done: imageCount > 0, section: 'imagenes' },
    { label: 'Una variante activa', done: activeVariants.length > 0, section: 'variantes' },
    { label: 'Unidades disponibles', done: totalStock > 0, section: 'variantes' },
    { label: 'Categoría activa', done: categoryIsActive, section: 'informacion' },
  ]
  const missing = readiness.filter((check) => !check.done)

  const handleSubmit = (values: ProductFormValues) => {
    updateProduct.mutate(
      { id: item.id, request: toUpdateProductRequest(values) },
      { onSuccess: () => toast({ message: 'Cambios guardados.' }) },
    )
  }

  const activate = () => {
    setStatus.mutate(
      { id: item.id, active: true },
      {
        onSuccess: () =>
          missing.length > 0
            ? toast({
                tone: 'info',
                message: `Producto activo, pero le falta: ${missing.map((m) => m.label.toLowerCase()).join(', ')}.`,
              })
            : toast({ message: 'El producto ya se ve en la tienda.' }),
        onError: (error) => toast({ tone: 'error', message: error.message }),
      },
    )
  }

  const handleToggleStatus = () => {
    if (item.isActive) {
      setStatus.reset()
      setConfirmDeactivate(true)
    } else {
      activate()
    }
  }

  const handleDeactivate = () => {
    setStatus.mutate(
      { id: item.id, active: false },
      {
        onSuccess: () => {
          setConfirmDeactivate(false)
          toast({ message: 'El producto se ocultó de la tienda.', action: { label: 'Deshacer', onClick: activate } })
        },
      },
    )
  }

  const applyDiscount = (percent: number) =>
    setDiscount.mutate(
      { id: item.id, percent },
      { onSuccess: () => toast({ message: `Descuento del ${percent}% aplicado.` }) },
    )

  const clearDiscount = () =>
    removeDiscount.mutate(item.id, { onSuccess: () => toast({ message: 'Descuento quitado.' }) })

  return (
    <>
      <title>{`${item.name} | Admin ${SITE_NAME}`}</title>

      <AdminPageHeader
        breadcrumbs={[...breadcrumbsBase, { label: item.name }]}
        title={
          <span className="flex items-center gap-4">
            <span className="hidden size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-admin-line bg-white sm:flex">
              {item.catalogMainUrl ? (
                <img
                  src={cloudinaryUrl(item.catalogMainUrl, 112)}
                  alt=""
                  className="size-full object-contain mix-blend-multiply"
                />
              ) : (
                <ImageOff size={18} strokeWidth={1.25} aria-hidden="true" className="text-ink-muted/50" />
              )}
            </span>
            <span className="min-w-0">{item.name}</span>
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-2 sm:pl-[72px]">
            <StatusBadge tone={item.isActive ? 'success' : 'neutral'}>
              {item.isActive ? 'Activo' : 'Inactivo'}
            </StatusBadge>
            {hasDiscount && <StatusBadge tone="info">-{item.discountPercent}%</StatusBadge>}
            <span>{item.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span>ID #{item.id}</span>
          </span>
        }
        actions={
          item.isActive ? (
            <a
              href={`/producto/${item.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={adminSecondaryButtonClass}
            >
              <ExternalLink size={15} strokeWidth={1.75} aria-hidden="true" />
              Ver en la tienda
            </a>
          ) : undefined
        }
      />

      {showCreatedNotice && (
        <div
          role="status"
          className="mb-4 flex items-start gap-3 rounded-2xl border border-admin-accent/20 bg-admin-accent/5 px-4 py-3 text-sm"
        >
          <PartyPopper size={18} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-admin-accent" />
          <p className="flex-1">
            <strong className="font-semibold">Producto creado.</strong> Está <strong>inactivo</strong>: agrega sus
            imágenes y actívalo cuando esté listo para la venta.
          </p>
          <button
            type="button"
            onClick={() => setShowCreatedNotice(false)}
            aria-label="Cerrar aviso"
            className="shrink-0 rounded-md p-1 text-ink-muted hover:bg-admin-accent/10 hover:text-ink"
          >
            <X size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Columna principal */}
        <div className="min-w-0 space-y-4">
          <AdminCard id="informacion" title="Información">
            <ProductForm
              key={`${item.id}-${formKey}`}
              formId={FORM_ID}
              onDirtyChange={handleDirtyChange}
              mode="edit"
              initialValues={toProductFormValues(item)}
              categories={categories.data ?? []}
              categoryName={item.categoryName}
              submitLabel="Guardar cambios"
              isSaving={updateProduct.isPending}
              serverError={updateProduct.error?.message ?? null}
              onSubmit={handleSubmit}
            />
          </AdminCard>

          <AdminCard
            id="variantes"
            title="Variantes"
            description="Cada combinación de talla y color tiene su SKU y sus unidades."
            flush
            actions={
              <span className="rounded-md bg-admin-bg px-2 py-1 text-xs font-medium tabular-nums text-ink-muted">
                Stock total: {totalStock}
              </span>
            }
          >
            <ProductVariantsManager productId={item.id} variants={item.variants} />
          </AdminCard>

          <AdminCard
            id="imagenes"
            title="Imágenes y video"
            description="La primera imagen es la principal del catálogo; la segunda aparece al pasar el mouse."
            actions={
              <span className="rounded-md bg-admin-bg px-2 py-1 text-xs font-medium tabular-nums text-ink-muted">
                {imageCount} de 9
              </span>
            }
          >
            <ProductMediaManager productId={item.id} media={item.media} />
          </AdminCard>
        </div>

        {/* Columna lateral */}
        {/* El aside ocupa todo el alto de la fila y su contenido se queda fijo al hacer scroll.
            El contenido mide al menos el alto visible (100vh - top-24 - padding inferior), y la
            última tarjeta crece para llenarlo: así, al llegar al final, su borde inferior queda
            alineado con la última tarjeta de la columna izquierda. */}
        <aside className="min-w-0">
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:min-h-[calc(100vh-8rem)]">
          <nav aria-label="Secciones del producto" className="hidden rounded-2xl border border-admin-line bg-white p-1.5 lg:flex">
            {sections.map(({ id: sectionId, label }) => (
              <a
                key={sectionId}
                href={`#${sectionId}`}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(sectionId)
                }}
                className="flex-1 rounded-lg px-2 py-1.5 text-center text-xs font-medium text-ink-muted transition-colors hover:bg-admin-bg hover:text-ink"
              >
                {label}
              </a>
            ))}
          </nav>
          <AdminCard title="Estado">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{item.isActive ? 'Visible en la tienda' : 'Oculto en la tienda'}</p>
                <p className="text-xs text-ink-muted">
                  {setStatus.isPending
                    ? 'Guardando…'
                    : item.isActive
                      ? 'Los clientes pueden verlo y comprarlo.'
                      : 'Actívalo cuando esté listo.'}
                </p>
              </div>
              <AdminSwitch
                checked={item.isActive}
                disabled={setStatus.isPending}
                label={item.isActive ? 'Desactivar producto' : 'Activar producto'}
                onChange={handleToggleStatus}
              />
            </div>

            <ReadinessChecklist items={readiness} />
          </AdminCard>

          <AdminCard title="Resumen">
            <dl className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Precio final', value: formatCOP(item.finalPrice), section: 'informacion' },
                { label: 'Unidades', value: totalStock, section: 'variantes' },
                { label: 'Variantes activas', value: `${activeVariants.length} de ${item.variants.length}`, section: 'variantes' },
                { label: 'Imágenes', value: `${imageCount} de 9`, section: 'imagenes' },
              ].map(({ label, value, section }) => (
                <div key={label} className="relative rounded-xl border border-admin-line px-3 py-2.5 transition-colors hover:border-admin-accent/40 hover:bg-admin-accent/[0.03]">
                  <dt className="text-[11px] text-ink-muted">
                    {/* Todo el cuadro lleva a su sección */}
                    <button
                      type="button"
                      onClick={() => scrollToSection(section)}
                      className="text-left after:absolute after:inset-0 after:content-['']"
                    >
                      {label}
                    </button>
                  </dt>
                  <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </AdminCard>

          <AdminCard title="Descuento" className="lg:flex-1">
            <ProductDiscountForm
              key={item.discountPercent ?? 'sin-descuento'}
              price={item.price}
              currentPercent={item.discountPercent}
              isSaving={setDiscount.isPending}
              isRemoving={removeDiscount.isPending}
              serverError={setDiscount.error?.message ?? removeDiscount.error?.message ?? null}
              onApply={applyDiscount}
              onRemove={clearDiscount}
            />
          </AdminCard>
          </div>
        </aside>
      </div>

      {/* Espacio para que la barra de guardado no tape el final de la página */}
      {isDirty && <div aria-hidden="true" className="h-16" />}

      {/* Barra de guardado: aparece con cambios sin guardar, esté donde esté el scroll */}
      {isDirty && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-admin-line bg-white/95 backdrop-blur-md animate-admin-fade md:left-[72px]">
          <div className="mx-auto flex w-full max-w-[2000px] flex-wrap items-center gap-3 px-4 py-3 md:px-6 xl:px-8">
            <p className="mr-auto flex items-center gap-2 text-sm font-medium">
              <span aria-hidden="true" className="size-2 rounded-full bg-amber-500" />
              Tienes cambios sin guardar
            </p>
            <button
              type="button"
              onClick={() => setFormKey((key) => key + 1)}
              disabled={updateProduct.isPending}
              className={adminSecondaryButtonClass}
            >
              Descartar
            </button>
            <button type="submit" form={FORM_ID} disabled={updateProduct.isPending} className={adminPrimaryButtonClass}>
              {updateProduct.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}

      <AdminConfirmDialog
        isOpen={blocker.state === 'blocked'}
        title="¿Salir sin guardar?"
        message="Tienes cambios en la información del producto que se perderán."
        confirmLabel="Salir sin guardar"
        loadingLabel="Saliendo..."
        isLoading={false}
        error={null}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />

      <AdminConfirmDialog
        isOpen={confirmDeactivate}
        title={`¿Desactivar "${item.name}"?`}
        message="Dejará de verse en la tienda. Podrás activarlo de nuevo cuando quieras."
        confirmLabel="Desactivar"
        loadingLabel="Desactivando..."
        isLoading={setStatus.isPending}
        error={setStatus.error?.message ?? null}
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmDeactivate(false)}
      />
    </>
  )
}

export default AdminProductEditPage
