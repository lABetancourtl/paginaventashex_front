// ─── Tienda pública: GET /api/home ───────────────────────────
export type HomeSectionType = 'Banner' | 'Products'
export type HomeMediaType = 'Image' | 'Video'

export interface HomeItemPublic {
  id: number
  url: string
  mediaType: HomeMediaType
  categorySlug: string | null // null = no es un enlace
  categoryName: string | null
  // Imagen para celular (ya recortada a 4:5). Solo llega si el banner tiene un único medio
  mobileUrl?: string | null
}

export interface HomeProductCard {
  id: number
  name: string
  categoryName?: string // Subcategoría: la tarjeta la muestra en lugar del nombre, como en el catálogo
  price: number
  discountPercent: number | null
  finalPrice: number
  catalogMainUrl: string | null
  catalogHoverUrl: string | null
  inStock: boolean
}

export interface HomeSectionPublic {
  id: number
  type: HomeSectionType
  title: string | null
  viewAllCategorySlug: string | null // Botón "Ver todo" (solo estantes)
  viewAllCategoryName: string | null
  items: HomeItemPublic[] // Solo en un Banner
  products: HomeProductCard[] // Solo en un estante
}

export interface HomePage {
  sections: HomeSectionPublic[]
}

// ─── Panel admin ─────────────────────────────────────────────
export interface HomeSectionAdmin {
  id: number
  type: HomeSectionType
  title: string | null
  categoryId: number | null
  categoryName: string | null
  categorySlug: string | null
  displayOrder: number
  isActive: boolean
  itemCount: number
  productCount: number
  createdAtUtc: string
}

export interface HomeItemAdmin {
  id: number
  sectionId: number
  url: string
  mobileUrl: string | null // Versión para celular (4:5); el admin la guarda aunque haya varios medios
  mediaType: HomeMediaType
  categoryId: number | null
  categoryName: string | null
  categorySlug: string | null
  displayOrder: number
}

export interface HomeProductAdmin {
  productId: number
  displayOrder: number
  name: string
  price: number
  discountPercent: number | null
  finalPrice: number
  catalogMainUrl: string | null
  inStock: boolean
  isActive: boolean
  isVisible: boolean
}

// Body de POST /api/home/sections (un banner no lleva título ni categoría)
export interface CreateHomeSectionRequest {
  type: HomeSectionType
  title?: string | null
  categoryId?: number | null
}

// Body de PUT /api/home/sections/{id}: reemplaza ambos campos
export interface UpdateHomeSectionRequest {
  title: string | null
  categoryId: number | null
}
