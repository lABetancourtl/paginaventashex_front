import type { CategoryTreeNode } from './types'

// Quita las categorías inactivas en todos los niveles del árbol
export function filterActive(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  return nodes
    .filter((node) => node.isActive)
    .map((node) => ({ ...node, children: filterActive(node.children) }))
}

export interface CategoryContext {
  root: CategoryTreeNode    // La categoría principal (la del header)
  current: CategoryTreeNode // La categoría de la URL (puede ser la misma)
}

// A partir del slug de la URL, encuentra la categoría y su principal.
// Soporta dos niveles: principales y sus hijas directas.
export function findCategoryContext(
  tree: CategoryTreeNode[],
  slug: string | undefined,
): CategoryContext | null {
  if (!slug) return null

  for (const root of tree) {
    if (root.slug === slug) {
      return { root, current: root }
    }

    const child = root.children.find((node) => node.slug === slug)
    if (child) {
      return { root, current: child }
    }
  }

  return null
}