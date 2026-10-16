import { useCategories } from '../hooks/useCategories'

function CategoryList() {
  const { data: categories, isPending, error } = useCategories()

  if (isPending) {
    return <p>Cargando categorías...</p>
  }

  if (error) {
    return <p>Error: {error.message}</p>
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