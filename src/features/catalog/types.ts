// Categoría tal como la retorna GET /api/categories
export interface Category {
  id: number
  name: string
  slug: string
  parentCategoryId: number | null
  isActive: boolean
  createdAtUtc: string
}

export interface CategoryTreeNode {
  id: number
  name: string
  slug: string
  parentCategoryId: number | null
  isActive: boolean
  children: CategoryTreeNode[]
}

// Producto tal como lo retorna GET /api/products/search
export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  sku: string
  stock: number
  isActive: boolean
  categoryId: number
  categoryName: string
  catalogMainUrl: string | null
  catalogHoverUrl: string | null
  media: unknown[] // Lo tiparemos con el detalle del producto
  createdAtUtc: string
  discountPercent: number | null
  finalPrice: number
}

// Filtros de búsqueda (los mismos de SearchProductsDto)
export interface ProductSearchParams {
  search?: string
  categorySlug?: string
  onSale?: boolean
  page: number
}