import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { ArrowLeft, X } from 'lucide-react'
import { ApiRequestError } from '../../api/client'
import ConfirmDialog from '../../components/ConfirmDialog'
import { SITE_NAME } from '../../config/site'
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
import ProductForm from '../components/ProductForm'
import ProductDiscountForm from '../components/ProductDiscountForm'
import StatusBadge from '../components/StatusBadge'
import { toProductFormValues, toUpdateProductRequest } from '../productForm'
import type { ProductFormValues } from '../productForm'
import { adminPrimaryButtonClass, adminSecondaryButtonClass } from '../adminStyles'
import ProductMediaManager from '../components/ProductMediaManager'

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
  const [savedNotice, setSavedNotice] = useState(false)

  const backLink = (
    <Link
      to="/admin/productos"
      className="mb-3 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
    >
      <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
      Productos
    </Link>
  )

  if (!isValidId || (product.error instanceof ApiRequestError && product.error.status === 404)) {
    return (
      <>
        {backLink}
        <AdminPageHeader title="Producto no encontrado" />
      </>
    )
  }

  if (product.isPending) return <p className="text-sm text-ink-muted">Cargando producto...</p>
  if (product.error) return <p className="text-sm text-danger">{product.error.message}</p>

  const item = product.data
  const imageCount = item.media.filter((media) => media.mediaType === 'Image').length

  const handleSubmit = (values: ProductFormValues) => {
    setSavedNotice(false)
    updateProduct.mutate(
      { id: item.id, request: toUpdateProductRequest(values) },
      { onSuccess: () => setSavedNotice(true) },
    )
  }

  const handleDeactivate = () => {
    setStatus.mutate(
      { id: item.id, active: false },
      { onSuccess: () => setConfirmDeactivate(false) },
    )
  }

  return (
    <>
      <title>{`${item.name} | Admin ${SITE_NAME}`}</title>

      {backLink}
      <AdminPageHeader title={item.name} description={`SKU ${item.sku} · ${item.categoryName}`} />

      {showCreatedNotice && (
        <div role="status" className="mb-4 flex items-start justify-between gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
          <p>
            Producto creado. Está <strong>inactivo</strong>: agrega sus imágenes y actívalo cuando esté
            listo para la venta.
          </p>
          <button
            type="button"
            onClick={() => setShowCreatedNotice(false)}
            aria-label="Cerrar aviso"
            className="shrink-0 rounded-md p-1 hover:bg-primary/10"
          >
            <X size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-4 lg:col-span-2">
          <AdminCard title="Información">
            <ProductForm
              key={item.id}
              mode="edit"
              initialValues={toProductFormValues(item)}
              categories={categories.data ?? []}
              categoryName={item.categoryName}
              submitLabel="Guardar cambios"
              isSaving={updateProduct.isPending}
              serverError={updateProduct.error?.message ?? null}
              onSubmit={handleSubmit}
            />
            {savedNotice && (
              <p role="status" className="mt-3 text-right text-sm text-primary">
                Cambios guardados.
              </p>
            )}
          </AdminCard>

          <AdminCard
            title="Imágenes"
            actions={<span className="text-xs text-ink-muted">{imageCount} de 9</span>}
          >
            <ProductMediaManager productId={item.id} media={item.media} />
          </AdminCard>
        </div>

        {/* Columna lateral */}
        <div className="space-y-4">
          <AdminCard title="Estado">
            <StatusBadge tone={item.isActive ? 'success' : 'neutral'}>
              {item.isActive ? 'Activo: se ve en la tienda' : 'Inactivo: no se ve en la tienda'}
            </StatusBadge>

            {!item.isActive && imageCount === 0 && (
              <p className="mt-3 text-xs text-amber-800">
                Este producto no tiene imágenes. Se verá sin foto en la tienda.
              </p>
            )}

            {setStatus.error && !confirmDeactivate && (
              <p role="alert" className="mt-3 text-sm text-danger">
                {setStatus.error.message}
              </p>
            )}

            <div className="mt-4">
              {item.isActive ? (
                <button
                  type="button"
                  onClick={() => {
                    setStatus.reset()
                    setConfirmDeactivate(true)
                  }}
                  className={adminSecondaryButtonClass}
                >
                  Desactivar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStatus.mutate({ id: item.id, active: true })}
                  disabled={setStatus.isPending}
                  className={adminPrimaryButtonClass}
                >
                  {setStatus.isPending ? 'Activando...' : 'Activar producto'}
                </button>
              )}
            </div>
          </AdminCard>

          <AdminCard title="Descuento">
            <ProductDiscountForm
              key={item.discountPercent ?? 'sin-descuento'}
              price={item.price}
              currentPercent={item.discountPercent}
              isSaving={setDiscount.isPending}
              isRemoving={removeDiscount.isPending}
              serverError={setDiscount.error?.message ?? removeDiscount.error?.message ?? null}
              onApply={(percent) => setDiscount.mutate({ id: item.id, percent })}
              onRemove={() => removeDiscount.mutate(item.id)}
            />
          </AdminCard>
        </div>
      </div>

      <ConfirmDialog
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