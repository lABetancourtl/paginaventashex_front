import { useParams } from 'react-router'

// Provisional: aquí irá el detalle con la galería de imágenes
function ProductDetailPage() {
  const { id } = useParams()

  return (
    <section>
      <h2 className="text-lg font-extrabold uppercase tracking-wide">Producto {id}</h2>
      <p className="mt-4 text-ink-muted">Muy pronto verás aquí el detalle del producto.</p>
    </section>
  )
}

export default ProductDetailPage