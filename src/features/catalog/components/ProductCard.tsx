import { useState } from 'react'

interface ProductCardProps {
  name: string
  price: number
  onAddToCart: (quantity: number) => void
}

function ProductCard({ name, price, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price)

  const handleIncrease = () => {
    setQuantity(quantity + 1)
  }

  const handleDecrease = () => {
    setQuantity(quantity - 1)
  }

  const handleAdd = () => {
    onAddToCart(quantity)
  }

  return (
    <div>
      <h3>{name}</h3>
      <p>{formattedPrice}</p>

      <button onClick={handleDecrease} disabled={quantity <= 1}>
        -
      </button>
      <span> {quantity} </span>
      <button onClick={handleIncrease}>+</button>

      <button onClick={handleAdd}>Agregar al carrito</button>
    </div>
  )
}

export default ProductCard