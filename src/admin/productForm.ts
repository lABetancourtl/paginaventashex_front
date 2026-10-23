import type { CreateProductRequest, Product, UpdateProductRequest } from '../features/catalog/types'

// ─── Modelo del formulario: todo es texto ────────────────────
export interface ProductFormValues {
  name: string
  description: string
  price: string
  sku: string
  stock: string
  categoryId: string
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>

export function emptyProductFormValues(): ProductFormValues {
  return { name: '', description: '', price: '', sku: '', stock: '', categoryId: '' }
}

export function toProductFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    description: product.description ?? '',
    price: String(Math.round(product.price)),
    sku: product.sku,
    stock: String(product.stock),
    categoryId: String(product.categoryId),
  }
}

// ─── Formulario → API ────────────────────────────────────────
export function toCreateProductRequest(values: ProductFormValues): CreateProductRequest {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    price: Number(values.price),
    sku: values.sku.trim().toUpperCase(),
    stock: Number(values.stock),
    categoryId: Number(values.categoryId),
  }
}

export function toUpdateProductRequest(values: ProductFormValues): UpdateProductRequest {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    price: Number(values.price),
  }
}

// ─── Validación (las mismas reglas del backend) ──────────────
export function validateProductForm(values: ProductFormValues, isCreate: boolean): ProductFormErrors {
  const errors: ProductFormErrors = {}

  if (values.name.trim() === '') errors.name = 'Escribe el nombre del producto.'
  else if (values.name.trim().length > 200) errors.name = 'Máximo 200 caracteres.'

  if (values.description.trim().length > 1000) errors.description = 'Máximo 1000 caracteres.'

  if (values.price === '' || Number(values.price) <= 0) errors.price = 'El precio debe ser mayor a cero.'

  // Estos tres solo se envían al crear
  if (isCreate) {
    if (values.sku.trim() === '') errors.sku = 'Escribe el SKU.'
    if (values.stock === '') errors.stock = 'Escribe las unidades disponibles (puede ser 0).'
    if (values.categoryId === '') errors.categoryId = 'Elige una subcategoría.'
  }

  return errors
}