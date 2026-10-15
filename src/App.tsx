import { useState } from 'react'
import ProductCard from './features/catalog/components/ProductCard'
import CategoryList from './features/catalog/components/CategoryList'
import DepartamentoList from './features/geography/components/DepartamentoList'
import LoginModal from './features/auth/components/LoginModal'
import AuthTest from './features/auth/components/AuthTest'
import { useAuth } from './features/auth/hooks/useAuth'

const products = [
  { id: 1, name: 'Audífonos Bluetooth', price: 150000 },
  { id: 2, name: 'Mouse inalámbrico', price: 45000 },
  { id: 3, name: 'Teclado mecánico', price: 280000 },
]

function App() {
  const { session, openLogin, logout } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  const handleAddToCart = (quantity: number) => {
    setCartCount(cartCount + quantity)
  }

  return (
    <div>
      {/* Header provisional: luego será su propio componente */}
      <header>
        <h1>PaginaVentasNet</h1>
        {session ? (
          <div>
            <span>Hola, {session.email}</span>
            <button type="button" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button type="button" onClick={openLogin}>
            Iniciar sesión
          </button>
        )}
      </header>

      {/* El modal se monta una sola vez, para toda la app */}
      <LoginModal />

      <AuthTest />

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