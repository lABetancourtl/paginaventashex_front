import { useParams } from 'react-router'
import { mainNavLinks } from '../layouts/mainNavLinks'

// Provisional: cuando hagamos el catálogo, aquí irán los productos de la categoría
function CategoryPage() {
  const { slug } = useParams()

  // Buscamos el nombre de la categoría para mostrarlo
  const category = mainNavLinks.find((link) => link.to === `/categoria/${slug}`)

  return (
    <section>
      <h2 className="text-lg font-extrabold uppercase tracking-wide">
        {category?.label ?? 'Categoría'}
      </h2>
      <p className="mt-4 text-ink-muted">Muy pronto verás aquí los productos de esta categoría.</p>
    </section>
  )
}

export default CategoryPage