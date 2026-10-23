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
  mediaType: 'Image' | 'Video'
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

// Nodo del árbol del panel (incluye inactivas y el orden)
export interface AdminCategoryNode {
  id: number
  name: string
  slug: string
  parentCategoryId: number | null
  isActive: boolean
  displayOrder: number
  children: AdminCategoryNode[]
}

// Body de POST /api/categories
export interface CreateCategoryRequest {
  name: string
  slug: string
  parentCategoryId: number | null
}

// Body de PUT /api/categories/{id}
export interface UpdateCategoryRequest {
  name: string
  slug: string
}

// Filtros de GET /api/products/admin
export interface AdminProductSearchParams {
  search?: string
  categoryIds?: number[]
  isActive?: boolean
  page: number
}

// Body de POST /api/products
export interface CreateProductRequest {
  name: string
  description: string
  price: number
  sku: string
  stock: number
  categoryId: number
}

// Body de PUT /api/products/{id} (no cambia sku, stock ni categoría)
export interface UpdateProductRequest {
  name: string
  description: string
  price: number
}