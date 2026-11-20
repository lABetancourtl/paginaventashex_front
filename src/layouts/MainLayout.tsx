import { Link, Outlet, ScrollRestoration, useLocation, useMatches, useParams } from 'react-router'
import { Search, ShoppingBag } from 'lucide-react'
import { useEffect } from 'react'
import { useHideOnScroll } from '../hooks/useHideOnScroll'
import { useBottomEdgeColor } from '../hooks/useBottomEdgeColor'
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
import BrandLogo from './BrandLogo'
import PageLoader from './PageLoader'
import FooterDeepSea from './FooterDeepSea'

function MainLayout() {
  const { slug } = useParams()
  const { pathname } = useLocation()
  
  // ¿La ruta actual pidió ocupar todo el ancho?
  const matches = useMatches()
  const isFullWidth = matches.some(
    (match) => (match.handle as RouteHandle | undefined)?.fullWidth,
  )

  const isFlushTop = matches.some(
    (match) => (match.handle as RouteHandle | undefined)?.flushTop,
  )

  const hideOnScroll = matches.some(
    (match) => (match.handle as RouteHandle | undefined)?.hideHeaderOnScroll,
  )
  const isHeaderHidden = useHideOnScroll(hideOnScroll)

  // En celular, el fondo que asoma abajo toma el color de lo que esté en el borde (footer o página)
  useBottomEdgeColor()

  // Publica el estado en <html>, para que otras partes de la página reaccionen con CSS
  useEffect(() => {
    document.documentElement.toggleAttribute('data-header-hidden', isHeaderHidden)
    return () => document.documentElement.removeAttribute('data-header-hidden')
  }, [isHeaderHidden])
  
  const { data: categories } = useCategoryTree()

  // ¿Qué categoría principal está activa según la URL?
  const isSaleView = useIsSaleView()
  const activeRootId = categories ? findCategoryContext(categories, slug)?.root.id : undefined
  
  return (
    // La altura del header incluye la franja de la barra de estado del teléfono (ver el header)
    <div className="flex min-h-screen flex-col pt-[calc(3.5rem+env(safe-area-inset-top))]">
      <header
        className={[
          'fixed inset-x-0 top-0 z-30 rounded-b-xl border-b border-white/10 text-white glass-dark',
          // Chrome en Android dibuja la página de borde a borde (viewport-fit=cover): al esconder
          // la barra de dirección, el header quedaría debajo de la barra de estado del teléfono.
          // Este relleno lo baja justo lo necesario (en computador y otros navegadores vale 0)
          'pt-[env(safe-area-inset-top)]',
          'transition-transform duration-500 motion-reduce:transition-none',
          // Solo con el foco del teclado: un clic con el mouse no lo mantiene visible
          'has-[:focus-visible]:translate-y-0 has-[:focus-visible]:delay-0',
          // Esconder: espera al subheader, arranque y final suaves
          // Mostrar: entra primero y frena suavemente al llegar
          isHeaderHidden
            ? '-translate-y-[calc(100%+1rem)] delay-150 ease-header-hide'
            : 'translate-y-0 delay-0 ease-header-show',
        ].join(' ')}
      >
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

          {/* Móvil: ocupa el espacio libre y centra la marca */}
          <div className="order-3 flex flex-1 justify-center md:order-none md:flex-none">
            <BrandLogo />
          </div>

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
      <CategorySubnav hidden={isHeaderHidden} />

      <main
        className={`w-full flex-1 ${
                    isFullWidth ? (isFlushTop ? '' : 'pt-4') : 'mx-auto max-w-6xl px-4 py-6 md:py-10'
        }`}
      >
        <Outlet />
      </main>
      
      <Footer />
      {/* key: en cada página nueva, la medusa vuelve a salir con otra frase */}
      <FooterDeepSea key={pathname} />
      <ScrollRestoration />
      <LoginModal />
      <PageLoader />
    </div>
  )
}

export default MainLayout