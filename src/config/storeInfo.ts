import { Clock, CreditCard, Package, Undo2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// PROVISIONAL: reemplazar por las condiciones reales de la tienda

// ─── Beneficios debajo del botón de compra ───────────────────
export interface StoreBenefit {
  icon: LucideIcon
  title: string
  text: string
}

export const productBenefits: StoreBenefit[] = [
  {
    icon: Package,
    title: 'Envíos gratis',
    text: 'En compras desde $150.000.',
  },
  {
    icon: Clock,
    title: 'Te llega en 3 a 5 días',
    text: 'Días hábiles para ciudades principales.',
  },
  {
    icon: Undo2,
    title: 'Cambios fáciles',
    text: 'Tienes 30 días para cambiar tu prenda.',
  },
  {
    icon: CreditCard,
    title: 'Métodos de pago',
    text: 'Tarjeta de crédito, débito, PSE y Nequi.',
  },
]

// ─── Sección "Envíos" ────────────────────────────────────────
export const shippingInfo: string[] = [
  'Envío gratis en compras desde $150.000 a todo el país.',
  'En compras menores, el valor del envío depende de tu ubicación y se calcula en el checkout.',
  'Los pedidos se despachan en un máximo de 2 días hábiles.',
  'Recibirás un correo con el número de guía para hacer seguimiento a tu pedido.',
]

// ─── Sección "Devoluciones y garantías" ──────────────────────
export interface PolicyItem {
  label: string
  text: string
}

export const returnsInfo: PolicyItem[] = [
  {
    label: 'Cambios',
    text: 'Tienes 30 días calendario desde que recibes tu pedido para solicitar un cambio de talla o de prenda.',
  },
  {
    label: 'Garantías',
    text: 'Tienes 60 días calendario desde que recibes tu pedido para solicitar la garantía por defectos de fabricación.',
  },
  {
    label: 'Devolución de dinero',
    text: 'Tienes 5 días hábiles desde que recibes tu pedido para solicitar la devolución del dinero.',
  },
  {
    label: 'Importante',
    text: 'Por higiene, los bodys y las medias no tienen cambio ni devolución, pero sí garantía.',
  },
]