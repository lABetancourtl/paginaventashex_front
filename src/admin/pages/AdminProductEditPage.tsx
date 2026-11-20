import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useBlocker, useLocation, useParams } from 'react-router'
import { ArrowLeft, Check, CloudOff, Eye, PackageX, PartyPopper, RotateCw, X } from 'lucide-react'
import { ApiRequestError } from '../../api/client'
import { SITE_NAME } from '../../config/site'
import { useAdminCategoryTree } from '../../features/catalog/hooks/useAdminCategoryTree'
import { useAdminProduct } from '../../features/catalog/hooks/useAdminProduct'
import {
  useRemoveProductDiscount,
  useSetProductDiscount,
  useSetProductStatus,
  useUpdateProduct,
} from '../../features/catalog/hooks/useProductMutations'
import AdminConfirmDialog from '../components/AdminConfirmDialog'
import AdminSwitch from '../components/AdminSwitch'
import ProductEditForm from '../components/ProductEditForm'
import ProductInsightsCard from '../components/ProductInsightsCard'
import ProductMediaManager from '../components/ProductMediaManager'
import ProductVariantsManager from '../components/ProductVariantsManager'
import { toProductEditValues, toUpdateProductRequest } from '../productForm'
import type { ProductEditValues } from '../productForm'
import {
  adminGhostButtonClass,
  adminOutlineButtonClass,
  adminPanelClass,
  adminSolidButtonClass,
} from '../adminStyles'
import { useAdminToast } from '../toast/toastContext'

const FORM_ID = 'product-edit-form'

const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

// Contenedor de la página: mismo ancho que la lista de productos
function PageFrame({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-col gap-3.5 md:gap-5">{children}</div>
}

function BackLink() {
  return (
    <Link
      to="/admin/productos"
      className="mb-1.5 hidden items-center gap-1.5 text-[13px] text-[#6b6a65] hover:text-admin-ink md:inline-flex"
    >
      <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
      Productos
    </Link>
  )
}

// Estado centrado (no encontrado, error)
function CenteredState({
  icon,
  tone,
  title,
  text,
  children,
}: {
  icon: ReactNode
  tone: 'neutral' | 'danger'
  title: string
  text: string
  children: ReactNode
}) {
  return (
    <section className={`${adminPanelClass} flex flex-col items-center gap-2 px-6 py-16 text-center`}>
      <span
        className={`flex size-11 items-center justify-center rounded-full ${
          tone === 'danger' ? 'bg-[#fdecea] text-[#b42318]' : 'bg-admin-hover text-[#4a4945]'
        }`}
      >
        {icon}
      </span>
      <p className="mt-1 text-[15px] font-semibold">{title}</p>
      <p className="max-w-[340px] text-sm text-[#6b6a65]">{text}</p>
      <div className="mt-2 flex gap-2">{children}</div>
    </section>
  )
}

function DetailSkeleton() {
  return (
    <div aria-label="Cargando producto" className="flex animate-pulse flex-col gap-5 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-[1.8] flex-col gap-5">
        {[0, 1, 2].map((key) => (
          <div key={key} className={`${adminPanelClass} flex flex-col gap-3.5 p-5`}>
            <div className="h-3.5 w-[30%] rounded-md bg-admin-active" />
            <div className="h-10 rounded-[9px] bg-[#f3f2ee]" />
            <div className="h-[84px] rounded-[9px] bg-[#f3f2ee]" />
          </div>
        ))}
      </div>
      <div className={`${adminPanelClass} flex flex-1 flex-col gap-3 p-5`}>
        <div className="h-3.5 w-[40%] rounded-md bg-admin-active" />
        <div className="h-3 w-[80%] rounded-md bg-[#f3f2ee]" />
        <div className="h-3 w-[70%] rounded-md bg-[#f3f2ee]" />
        <div className="h-3 w-[75%] rounded-md bg-[#f3f2ee]" />
      </div>
    </div>
  )
}

interface ReadinessCheck {
  label: string
  done: boolean
  fix: { label: string; section?: string; to?: string }
}

// Interruptor de visibilidad + lo que le falta al producto para venderse
function VisibilityCard({
  isActive,
  isSaving,
  checks,
  onToggle,
}: {
  isActive: boolean
  isSaving: boolean
  checks: ReadinessCheck[]
  onToggle: () => void
}) {
  const doneCount = checks.filter((check) => check.done).length
  const allDone = doneCount === checks.length

  return (
    <section className={adminPanelClass}>
      <div className="flex items-center gap-3 py-4 pl-5 pr-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold">Visible en la tienda</h2>
          <p className="text-[13px] text-[#6b6a65]">
            {isSaving ? 'Guardando…' : isActive ? 'Los clientes pueden verlo.' : 'Solo tú puedes verlo.'}
          </p>
        </div>
        <span className="flex h-10 w-12 items-center justify-center">
          <AdminSwitch
            tone="ink"
            checked={isActive}
            disabled={isSaving}
            label={isActive ? 'Ocultar de la tienda' : 'Mostrar en la tienda'}
            onChange={onToggle}
          />
        </span>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-admin-row-line px-5 pb-4 pt-3.5">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${allDone ? 'text-[#1f7a45]' : 'text-[#8a5a00]'}`}>
            {allDone ? 'Listo para vender' : 'Falta para vender'}
          </span>
          <span className="ml-auto text-xs tabular-nums text-[#8b8a84]">
            {doneCount} de {checks.length}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Progreso para vender"
          aria-valuenow={doneCount}
          aria-valuemin={0}
          aria-valuemax={checks.length}
          className="h-1 overflow-hidden rounded-sm bg-admin-active"
        >
          <div
            className={`h-full transition-[width] duration-200 ${allDone ? 'bg-[#2f9e5b]' : 'bg-[#e3a008]'}`}
            style={{ width: `${(doneCount / checks.length) * 100}%` }}
          />
        </div>

        <ul className="flex flex-col">
          {checks.map(({ label, done, fix }) => (
            <li key={label} className="flex min-h-7 items-center gap-2.5 py-0.5">
              <span
                aria-hidden="true"
                className={`flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                  done ? 'border-[#2f9e5b] bg-[#2f9e5b] text-white' : 'border-[#cfcec8] bg-white'
                }`}
              >
                {done && <Check size={11} strokeWidth={3} />}
              </span>
              <span className={`flex-1 text-[13px] ${done ? 'text-[#6b6a65]' : 'text-admin-ink'}`}>
                {label}
                <span className="sr-only">{done ? ' (listo)' : ' (pendiente)'}</span>
              </span>
              {!done &&
                (fix.to ? (
                  <Link
                    to={fix.to}
                    className="inline-flex h-7 items-center rounded-[7px] border border-[#dcdbd6] bg-white px-2.5 text-xs font-medium hover:bg-admin-bg"
                  >
                    {fix.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => fix.section && scrollToSection(fix.section)}
                    className="inline-flex h-7 items-center rounded-[7px] border border-[#dcdbd6] bg-white px-2.5 text-xs font-medium hover:bg-admin-bg"
                  >
                    {fix.label}
                  </button>
                ))}
            </li>
          ))}
        </ul>
      </div>
    </section>
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
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const handleDirtyChange = useCallback((dirty: boolean) => setIsDirty(dirty), [])

  // Si sale del producto con cambios, se le pregunta antes
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
      <PageFrame>
        <div>
          <BackLink />
          <h1 className="text-2xl font-semibold tracking-tight">Producto no encontrado</h1>
        </div>
        <CenteredState
          tone="neutral"
          icon={<PackageX size={20} strokeWidth={1.75} aria-hidden="true" />}
          title="Este producto no existe"
          text="Puede que el enlace esté mal o que el producto ya no exista."
        >
          <Link to="/admin/productos" className={adminOutlineButtonClass}>
            Volver a Productos
          </Link>
        </CenteredState>
      </PageFrame>
    )
  }

  if (product.isPending) {
    return (
      <PageFrame>
        <div className="h-[60px] w-72 animate-pulse rounded-lg bg-admin-active" />
        <DetailSkeleton />
      </PageFrame>
    )
  }

  if (product.error) {
    return (
      <PageFrame>
        <CenteredState
          tone="danger"
          icon={<CloudOff size={20} strokeWidth={1.75} aria-hidden="true" />}
          title="No pudimos cargar este producto"
          text="Revisa tu conexión y vuelve a intentarlo. Tus cambios guardados siguen a salvo."
        >
          <button type="button" onClick={() => product.refetch()} className={adminOutlineButtonClass}>
            <RotateCw size={14} strokeWidth={1.75} aria-hidden="true" />
            Reintentar
          </button>
          <Link to="/admin/productos" className={adminGhostButtonClass}>
            Volver a Productos
          </Link>
        </CenteredState>
      </PageFrame>
    )
  }

  const item = product.data
  const imageCount = item.media.filter((media) => media.mediaType === 'Image').length
  const activeVariants = item.variants.filter((variant) => variant.isActive)
  const totalStock = activeVariants.reduce((sum, variant) => sum + variant.stock, 0)

  const categoryIsActive =
    categories.data?.some(
      (root) => root.isActive && root.children.some((child) => child.id === item.categoryId && child.isActive),
    ) ?? true
  const checks: ReadinessCheck[] = [
    { label: 'Al menos una imagen', done: imageCount > 0, fix: { label: 'Subir', section: 'imagenes' } },
    { label: 'Una variante activa', done: activeVariants.length > 0, fix: { label: 'Agregar', section: 'variantes' } },
    { label: 'Stock disponible', done: totalStock > 0, fix: { label: 'Reponer', section: 'variantes' } },
    { label: 'Categoría activa', done: categoryIsActive, fix: { label: 'Revisar', to: '/admin/categorias' } },
  ]
  const missing = checks.filter((check) => !check.done)

  // Estado que se lee en la cabecera
  const status = !item.isActive
    ? { text: 'Oculto', dot: 'bg-[#b5b4ae]', ink: 'text-[#6b6a65]' }
    : missing.length === 0
      ? { text: 'Visible en la tienda', dot: 'bg-[#2f9e5b]', ink: 'text-[#1f7a45]' }
      : { text: 'Visible, pero no se puede comprar', dot: 'bg-[#e3a008]', ink: 'text-[#8a5a00]' }

  // ─── Guardar: información y descuento salen del mismo formulario ─────
  const handleSubmit = async ({ form, discount }: ProductEditValues) => {
    const saved = toProductEditValues(item)
    const infoChanged = (Object.keys(form) as (keyof typeof form)[]).some((key) => form[key] !== saved.form[key])
    const discountChanged = discount !== saved.discount

    setIsSaving(true)
    setSaveError(null)
    try {
      if (infoChanged) await updateProduct.mutateAsync({ id: item.id, request: toUpdateProductRequest(form) })
      if (discountChanged) {
        if (discount > 0) await setDiscount.mutateAsync({ id: item.id, percent: discount })
        else await removeDiscount.mutateAsync(item.id)
      }
      // Las mutaciones esperan a que el producto se recargue: el formulario arranca con los datos nuevos
      setFormKey((key) => key + 1)
      toast({ message: 'Cambios guardados.' })
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudieron guardar los cambios.')
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Mostrar y ocultar ────────────────────────────────────
  const activate = () => {
    setStatus.mutate(
      { id: item.id, active: true },
      {
        onSuccess: () =>
          missing.length > 0
            ? toast({
                tone: 'info',
                message: `Ya es visible, pero le falta: ${missing.map((m) => m.label.toLowerCase()).join(', ')}.`,
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

  return (
    <PageFrame>
      <title>{`${item.name} | Admin ${SITE_NAME}`}</title>

      {/* Cabecera */}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-[1_1_300px]">
          <BackLink />
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.025em] text-pretty md:text-2xl">
            {item.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-[#6b6a65]">
            <span className={`inline-flex items-center gap-1.5 font-medium ${status.ink}`}>
              <span aria-hidden="true" className={`size-[7px] rounded-full ${status.dot}`} />
              {status.text}
            </span>
            <span>{item.categoryName}</span>
            <span className="font-mono text-xs">ID {item.id}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.isActive && (
            <a
              href={`/producto/${item.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${adminOutlineButtonClass} rounded-[9px] text-sm`}
            >
              <Eye size={16} strokeWidth={1.75} aria-hidden="true" />
              Ver en tienda
            </a>
          )}
          <button
            type="submit"
            form={FORM_ID}
            disabled={!isDirty || isSaving}
            className={adminSolidButtonClass}
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {showCreatedNotice && (
        <div role="status" className={`${adminPanelClass} flex items-start gap-3 px-4 py-3 text-sm`}>
          <PartyPopper size={18} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-admin-accent" />
          <p className="flex-1">
            <strong className="font-semibold">Producto creado.</strong> Está <strong>oculto</strong>: agrega sus
            imágenes y muéstralo en la tienda cuando esté listo para la venta.
          </p>
          <button
            type="button"
            onClick={() => setShowCreatedNotice(false)}
            aria-label="Cerrar aviso"
            className="shrink-0 rounded-md p-1 text-[#8b8a84] hover:bg-admin-hover hover:text-admin-ink"
          >
            <X size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3.5 md:gap-5 lg:flex-row lg:items-start">
        {/* Columna principal */}
        <div className="flex min-w-0 flex-col gap-3.5 md:gap-5 lg:flex-[1.8_1_460px]">
          <ProductEditForm
            key={`${item.id}-${formKey}`}
            formId={FORM_ID}
            product={item}
            isSaving={isSaving}
            serverError={saveError}
            onDirtyChange={handleDirtyChange}
            onSubmit={handleSubmit}
          />

          <ProductVariantsManager productId={item.id} variants={item.variants} />

          <ProductMediaManager productId={item.id} media={item.media} />
        </div>

        {/* Columna lateral: en celular va primero */}
        <aside className="-order-1 flex min-w-0 flex-col gap-3.5 md:gap-5 lg:sticky lg:top-[84px] lg:order-none lg:flex-[1_1_280px]">
          <VisibilityCard
            isActive={item.isActive}
            isSaving={setStatus.isPending}
            checks={checks}
            onToggle={handleToggleStatus}
          />
          <ProductInsightsCard productId={item.id} />
        </aside>
      </div>

      <AdminConfirmDialog
        isOpen={blocker.state === 'blocked'}
        title="¿Salir sin guardar?"
        message="Tienes cambios en la información o el precio del producto que se perderán."
        confirmLabel="Salir sin guardar"
        loadingLabel="Saliendo..."
        isLoading={false}
        error={null}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />

      <AdminConfirmDialog
        isOpen={confirmDeactivate}
        title={`¿Ocultar "${item.name}"?`}
        message="Dejará de verse en la tienda. Podrás mostrarlo de nuevo cuando quieras."
        confirmLabel="Ocultar"
        loadingLabel="Ocultando..."
        isLoading={setStatus.isPending}
        error={setStatus.error?.message ?? null}
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmDeactivate(false)}
      />
    </PageFrame>
  )
}

export default AdminProductEditPage
