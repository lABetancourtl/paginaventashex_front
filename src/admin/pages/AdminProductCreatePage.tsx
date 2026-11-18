import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Eye, FileText, ImagePlus, Layers } from 'lucide-react'
import { SITE_NAME } from '../../config/site'
import { useAdminCategoryTree } from '../../features/catalog/hooks/useAdminCategoryTree'
import { useCreateProduct } from '../../features/catalog/hooks/useProductMutations'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminCard from '../components/AdminCard'
import ProductForm from '../components/ProductForm'
import { emptyProductFormValues, toCreateProductRequest } from '../productForm'
import type { ProductFormValues } from '../productForm'
import { useAdminToast } from '../toast/toastContext'

// El camino completo hasta vender: aquí se hace el paso 1
const steps = [
  { icon: FileText, title: 'Datos básicos', text: 'Nombre, descripción, precio y categoría.' },
  { icon: ImagePlus, title: 'Imágenes y video', text: 'Hasta 9 imágenes y un video corto.' },
  { icon: Layers, title: 'Tallas y colores', text: 'Cada variante con su SKU y unidades.' },
  { icon: Eye, title: 'Activarlo', text: 'Cuando esté listo, hazlo visible en la tienda.' },
]

function AdminProductCreatePage() {
  const navigate = useNavigate()
  const categories = useAdminCategoryTree()
  const createProduct = useCreateProduct()
  const toast = useAdminToast()
  const [formKey, setFormKey] = useState(0) // Al cambiarla, el formulario queda en blanco

  const handleSubmit = (values: ProductFormValues, { another }: { another: boolean }) => {
    createProduct.mutate(toCreateProductRequest(values), {
      onSuccess: (id) => {
        if (another) {
          // Se queda aquí con el formulario limpio, para cargar varios seguidos
          setFormKey((key) => key + 1)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          toast({
            message: `"${values.name}" creado (inactivo).`,
            action: { label: 'Abrir', onClick: () => navigate(`/admin/productos/${id}`) },
          })
          return
        }
        // Va a la edición, donde se agregan las imágenes y se activa
        navigate(`/admin/productos/${id}`, { state: { created: true } })
      },
    })
  }

  return (
    <>
      <title>{`Nuevo producto | Admin ${SITE_NAME}`}</title>

      <AdminPageHeader
        title="Nuevo producto"
        description="Completa los datos básicos. Se creará inactivo para que lo prepares antes de venderlo."
        breadcrumbs={[{ label: 'Productos', to: '/admin/productos' }, { label: 'Nuevo producto' }]}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <AdminCard title="Datos del producto">
          {categories.isPending ? (
            <div className="space-y-4" aria-label="Cargando formulario">
              {[0, 1, 2].map((row) => (
                <div key={row} className="h-10 animate-pulse rounded-lg bg-admin-bg" />
              ))}
            </div>
          ) : (
            <ProductForm
              key={formKey}
              mode="create"
              initialValues={emptyProductFormValues()}
              categories={categories.data ?? []}
              submitLabel="Crear producto"
              anotherLabel="Crear y agregar otro"
              cancelHref="/admin/productos"
              isSaving={createProduct.isPending}
              serverError={createProduct.error?.message ?? null}
              onSubmit={handleSubmit}
            />
          )}
        </AdminCard>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <AdminCard title="Pasos para vender">
            <ol className="relative">
              {steps.map(({ icon: Icon, title, text }, index) => {
                const isCurrent = index === 0
                return (
                  <li key={title} className="relative flex gap-3 pb-5 last:pb-0">
                    {/* Línea que une los pasos */}
                    {index < steps.length - 1 && (
                      <span aria-hidden="true" className="absolute left-[17px] top-10 bottom-1 w-px bg-admin-line" />
                    )}
                    <span
                      aria-hidden="true"
                      className={`relative flex size-9 shrink-0 items-center justify-center rounded-xl ${
                        isCurrent ? 'bg-admin-accent text-white shadow-sm shadow-admin-accent/30' : 'bg-admin-bg text-ink-muted'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.75} />
                    </span>
                    <div className="pt-0.5">
                      <p className={`text-sm ${isCurrent ? 'font-semibold text-ink' : 'font-medium text-ink-muted'}`}>
                        <span className="sr-only">Paso {index + 1}{isCurrent ? ' (actual)' : ''}: </span>
                        {title}
                      </p>
                      <p className="text-xs text-ink-muted">{text}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
            <p className="mt-4 rounded-lg bg-admin-bg px-3 py-2 text-xs text-ink-muted">
              Los pasos 2 a 4 se hacen en la página del producto, después de crearlo.
            </p>
          </AdminCard>
        </aside>
      </div>
    </>
  )
}

export default AdminProductCreatePage
