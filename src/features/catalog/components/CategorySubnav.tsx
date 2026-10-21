import { Link, useParams } from 'react-router'
import { useCategoryTree } from '../hooks/useCategoryTree'
import { findCategoryContext } from '../categoryTree'
import { useIsSaleView } from '../hooks/useIsSaleView'
import { categoryPath } from '../catalogNav'

const itemClass = [
  'block whitespace-nowrap py-3 text-xs font-bold uppercase tracking-wider text-ink/60',
  'hover:text-ink',
  'aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:underline-offset-8',
].join(' ')

function CategorySubnav() {
  const { slug } = useParams()
  const { data: categories } = useCategoryTree()
  const isSaleView = useIsSaleView()

  const context = categories ? findCategoryContext(categories, slug) : null

  // Solo aparece dentro de una categoría que tenga subcategorías
  if (!context || context.root.children.length === 0) {
    return null
  }

  const { root, current } = context
  const isRootActive = current.id === root.id

  return (
    <nav
      aria-label={`Subcategorías de ${root.name}`}
      className="sticky top-14 z-20 border-b border-line bg-canvas/95 backdrop-blur-md"
    >
      <ul className="flex gap-6 overflow-x-auto px-4 md:gap-8 md:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <li className="shrink-0">
          <Link
            to={categoryPath(root.slug, isSaleView)}
            aria-current={isRootActive ? 'page' : undefined}
            className={itemClass}
          >
            Todo
          </Link>
        </li>

        {root.children.map((child) => (
          <li key={child.id} className="shrink-0">
            <Link
              to={categoryPath(child.slug, isSaleView)}
              aria-current={child.id === current.id ? 'page' : undefined}
              className={itemClass}
            >
              {child.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default CategorySubnav