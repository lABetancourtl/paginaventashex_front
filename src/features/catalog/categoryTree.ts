import type { AdminCategoryNode, CategoryTreeNode } from './types'


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

// Igual que findCategoryContext, pero buscando por id
export function findCategoryContextById(
  tree: CategoryTreeNode[],
  id: number,
): CategoryContext | null {
  for (const root of tree) {
    if (root.id === id) {
      return { root, current: root }
    }

    const child = root.children.find((node) => node.id === id)
    if (child) {
      return { root, current: child }
    }
  }

  return null
}

// Ordena cada nivel del árbol por displayOrder
export function sortByDisplayOrder(nodes: AdminCategoryNode[]): AdminCategoryNode[] {
  return [...nodes]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((node) => ({ ...node, children: sortByDisplayOrder(node.children) }))
}

// Intercambia el orden entre una categoría y la hermana que ocupa el orden destino
// (la misma regla del backend, para la actualización optimista)
export function swapDisplayOrder(
  nodes: AdminCategoryNode[],
  id: number,
  newDisplayOrder: number,
): AdminCategoryNode[] {
  const moving = nodes.find((node) => node.id === id)

  if (moving) {
    const oldOrder = moving.displayOrder
    return nodes.map((node) => {
      if (node.id === id) return { ...node, displayOrder: newDisplayOrder }
      if (node.displayOrder === newDisplayOrder) return { ...node, displayOrder: oldOrder }
      return node
    })
  }

  // No está en este nivel: lo buscamos entre los hijos
  return nodes.map((node) => ({
    ...node,
    children: swapDisplayOrder(node.children, id, newDisplayOrder),
  }))
}