import { formatCOP } from '../../../utils/formatters'

type PriceSize = 'sm' | 'lg'

interface ProductPriceProps {
  price: number
  finalPrice: number
  discountPercent: number | null
  size?: PriceSize
}

const sizeClasses: Record<PriceSize, string> = {
  sm: 'text-xs',
  lg: 'text-base md:text-lg',
}

function ProductPrice({ price, finalPrice, discountPercent, size = 'sm' }: ProductPriceProps) {
  const hasDiscount = discountPercent !== null && discountPercent > 0

  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 ${sizeClasses[size]}`}>
      {hasDiscount && (
        <span className="text-ink-muted line-through">
          <span className="sr-only">Antes </span>
          {formatCOP(price)}
        </span>
      )}
      {/* Detalle: precio final en negro y negrita · Tarjetas: verde si hay descuento */}
      <span className={size === 'lg' ? 'font-bold text-ink' : hasDiscount ? 'font-bold text-sale-ink' : undefined}>
        {hasDiscount && <span className="sr-only">ahora </span>}
        {formatCOP(finalPrice)}
      </span>
      {/* En el detalle, el porcentaje va junto al precio */}
      {hasDiscount && size === 'lg' && (
        <span className="rounded-xs bg-sale-ink px-1.5 py-0.5 text-[0.625rem] font-bold text-white">
          -{discountPercent}%
        </span>
      )}
    </p>
  )
}

export default ProductPrice