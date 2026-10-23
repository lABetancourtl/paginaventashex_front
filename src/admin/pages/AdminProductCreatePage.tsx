import { Link, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { SITE_NAME } from '../../config/site'
import { useAdminCategoryTree } from '../../features/catalog/hooks/useAdminCategoryTree'
import { useCreateProduct } from '../../features/catalog/hooks/useProductMutations'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminCard from '../components/AdminCard'
import ProductForm from '../components/ProductForm'
import { emptyProductFormValues, toCreateProductRequest } from '../productForm'
import type { ProductFormValues } from '../productForm'

function AdminProductCreatePage() {
  const navigate = useNavigate()
  const categories = useAdminCategoryTree()
  const createProduct = useCreateProduct()

  const handleSubmit = (values: ProductFormValues) => {
    createProduct.mutate(toCreateProductRequest(values), {
      // Va a la edición, donde se agregan las imágenes y se activa
      onSuccess: (id) => navigate(`/admin/productos/${id}`, { state: { created: true } }),
    })
  }

  return (
    <>
      <title>{`Nuevo producto | Admin ${SITE_NAME}`}</title>

      <Link
        to="/admin/productos"
        className="mb-3 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
        Productos
      </Link>

      <AdminPageHeader
        title="Nuevo producto"
        description="Después de crearlo podrás agregar imágenes, un descuento y activarlo."
      />

      <AdminCard className="max-w-3xl">
        {categories.isPending ? (
          <p className="text-sm text-ink-muted">Cargando categorías...</p>
        ) : (
          <ProductForm
            mode="create"
            initialValues={emptyProductFormValues()}
            categories={categories.data ?? []}
            submitLabel="Crear producto"
            isSaving={createProduct.isPending}
            serverError={createProduct.error?.message ?? null}
            onSubmit={handleSubmit}
          />
        )}
      </AdminCard>
    </>
  )
}

export default AdminProductCreatePage