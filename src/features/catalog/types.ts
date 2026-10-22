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

// Imagen o video de la galería de un producto
export interface ProductMedia {
  id: number
  url: string
  mediaType: string // 'Image' por ahora; confirmar si existen otros tipos
  displayOrder: number
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
  media: ProductMedia[]
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