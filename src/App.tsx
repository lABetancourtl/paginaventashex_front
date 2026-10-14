import { useState } from 'react'
import ProductCard from './features/catalog/components/ProductCard'
import CategoryList from './features/catalog/components/CategoryList'
import DepartamentoList from './features/geography/components/DepartamentoList'
import OtpLogin from './features/auth/components/OtpLogin'

const products = [
  { id: 1, name: 'Audífonos Bluetooth', price: 150000 },
  { id: 2, name: 'Mouse inalámbrico', price: 45000 },
  { id: 3, name: 'Teclado mecánico', price: 280000 },
]

function App() {
  const [cartCount, setCartCount] = useState(0)

  const handleAddToCart = (quantity: number) => {
    setCartCount(cartCount + quantity)
  }

  return (
    <div>
      <h1>PaginaVentasNet</h1>

      <OtpLogin />

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

export default App