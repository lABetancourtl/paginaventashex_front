import { useCategories } from '../hooks/useCategories'

function CategoryList() {
  // Toda la lógica de carga está en el hook
  const { categories, isLoading, error } = useCategories()

  if (isLoading) {
    return <p>Cargando categorías...</p>
  }

  if (error) {
    return <p>Error: {error}</p>
  }

  return (
    <div>
      <h2>Categorías</h2>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            {category.name}
            {category.parentCategoryId !== null && (
              <small> (subcategoría de {category.parentCategoryId})</small>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CategoryList