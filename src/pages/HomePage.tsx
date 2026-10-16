import { useState } from 'react'
import ProductCard from '../features/catalog/components/ProductCard'
import CategoryList from '../features/catalog/components/CategoryList'
import DepartamentoList from '../features/geography/components/DepartamentoList'

// Productos de prueba: los reemplazaremos con el catálogo real
const products = [
  { id: 1, name: 'Audífonos Bluetooth', price: 150000 },
  { id: 2, name: 'Mouse inalámbrico', price: 45000 },
  { id: 3, name: 'Teclado mecánico', price: 280000 },
]

function HomePage() {
  const [cartCount, setCartCount] = useState(0)

  const handleAddToCart = (quantity: number) => {
    setCartCount(cartCount + quantity)
  }

  return (
    <div>
      <p>Productos en el carrito: {cartCount}</p>

      <CategoryList />
      <DepartamentoList />

      {products.map((product) => (
        <ProductCard
          key={product.id}
          name={product.name}
          price={product.price}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  )
}

export default HomePage