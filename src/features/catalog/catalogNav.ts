import type { CategoryTreeNode } from './types'

// Parámetro de la URL que activa el filtro de ofertas: ?sale=1
export const SALE_PARAM = 'sale'

// Categorías principales que aparecen dentro de "Sale".
// En el futuro: que el backend indique qué categorías tienen ofertas
const SALE_CATEGORY_SLUGS = ['nino', 'nina']

// Construye la ruta de una categoría, con o sin el filtro de ofertas
export function categoryPath(slug: string, onSale = false): string {
  return onSale ? `/categoria/${slug}?${SALE_PARAM}=1` : `/categoria/${slug}`
}

// Las categorías principales de Sale, en el orden de la lista
export function getSaleCategories(tree: CategoryTreeNode[]): CategoryTreeNode[] {
  return SALE_CATEGORY_SLUGS.map((slug) => tree.find((node) => node.slug === slug)).filter(
    (node): node is CategoryTreeNode => node !== undefined,
  )
}