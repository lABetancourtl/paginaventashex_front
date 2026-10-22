import { Link, Outlet, ScrollRestoration, useMatches, useParams } from 'react-router'
import { Search, ShoppingBag } from 'lucide-react'
import LoginModal from '../features/auth/components/LoginModal'
import UserMenu from '../features/account/components/UserMenu'
import CategorySubnav from '../features/catalog/components/CategorySubnav'
import { useCategoryTree } from '../features/catalog/hooks/useCategoryTree'
import { findCategoryContext } from '../features/catalog/categoryTree'
import MobileNav from './MobileNav'
import { headerIconButtonClass, headerNavLinkClass } from './headerStyles'
import SaleNavItem from '../features/catalog/components/SaleNavItem'
import { useIsSaleView } from '../features/catalog/hooks/useIsSaleView'
import { categoryPath } from '../features/catalog/catalogNav'
import type { RouteHandle } from '../routes/routeHandle'
import Footer from './Footer'

function MainLayout() {
  const { slug } = useParams()
  
  // ¿La ruta actual pidió ocupar todo el ancho?
  const matches = useMatches()
  const isFullWidth = matches.some(
    (match) => (match.handle as RouteHandle | undefined)?.fullWidth,
  )
  
  const { data: categories } = useCategoryTree()

  // ¿Qué categoría principal está activa según la URL?
  const isSaleView = useIsSaleView()
  const activeRootId = categories ? findCategoryContext(categories, slug)?.root.id : undefined
  
  return (
    <div className="flex min-h-screen flex-col pt-14">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 text-white glass-dark">
        <div className="flex h-14 items-center gap-1 px-2 md:gap-2 md:px-6">
          <MobileNav />

          <nav aria-label="Principal" className="hidden md:flex md:flex-1 md:items-center md:gap-7">
            {categories?.map((category) => (
              <Link
                key={category.id}
                to={categoryPath(category.slug)}
                // En la vista de Sale, el activo es "Sale", no la categoría
                aria-current={!isSaleView && category.id === activeRootId ? 'true' : undefined}
                className={headerNavLinkClass}
              >
                {category.name}
              </Link>
            ))}

            {categories && (
              <SaleNavItem
                categories={categories}
                isSaleView={isSaleView}
                activeRootId={activeRootId}
              />
            )}
          </nav>

          <Link
            to="/"
            className="order-3 flex-1 text-center text-sm font-extrabold uppercase tracking-wider focus-visible:outline-white md:order-none md:flex-none md:text-base"
          >
            Tisoro
          </Link>

          <div className="contents md:flex md:flex-1 md:items-center md:justify-end md:gap-1">
            <div className="order-2 md:order-none">
              <UserMenu />
            </div>

            <button
              type="button"
              aria-label="Buscar"
              className={`order-4 md:order-none ${headerIconButtonClass}`}
            >
              <Search size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label="Carrito de compras"
              className={`order-5 md:order-none ${headerIconButtonClass}`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Subcategorías: solo dentro de una categoría */}
      <CategorySubnav />

      <main
        className={`w-full flex-1 ${
                    isFullWidth ? 'pt-4' : 'mx-auto max-w-6xl px-4 py-6 md:py-10'
        }`}
      >
        <Outlet />
      </main>
      
      <Footer />
      <ScrollRestoration />
      <LoginModal />
    </div>
  )
}

export default MainLayout