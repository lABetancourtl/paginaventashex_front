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

// Una combinación de talla y color, con su propio SKU y stock
export interface ProductVariant {
  id: number
  sizeId: number | null
  sizeGroup: string | null
  sizeName: string | null
  colorId: number | null
  colorName: string | null
  colorHexCode: string | null
  sku: string
  stock: number
  isActive: boolean
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
  inStock?: boolean
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

// Detalle público de GET /api/products/{id}: el SKU y el stock viven en cada variante
export interface ProductDetail {
  id: number
  name: string
  description: string | null
  price: number
  discountPercent: number | null
  finalPrice: number
  inStock: boolean
  categoryId: number
  categoryName: string
  catalogMainUrl: string | null
  catalogHoverUrl: string | null
  media: ProductMedia[]
  variants: ProductVariant[]
}