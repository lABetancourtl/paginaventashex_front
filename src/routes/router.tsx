import { createBrowserRouter, Navigate } from 'react-router'
import MainLayout from '../layouts/MainLayout'
import AccountLayout from '../layouts/AccountLayout'
import RequireAuth from './RequireAuth'
import HomePage from '../pages/HomePage'
import ProfilePage from '../pages/ProfilePage'
import ProfileEditPage from '../pages/ProfileEditPage'
import AddressesPage from '../pages/AddressesPage'
import AuthenticationPage from '../pages/AuthenticationPage'
import NotFoundPage from '../pages/NotFoundPage'
import AddressCreatePage from '../pages/AddressCreatePage'
import AddressEditPage from '../pages/AddressEditPage'
import AccountHomePage from '../pages/AccountHomePage'
import CategoryPage from '../pages/CategoryPage'
import ProductDetailPage from '../pages/ProductDetailPage'
import { lazy, Suspense } from 'react'

// ─── Panel de administración: se descarga solo al entrar a /admin ───
const AdminLayout = lazy(() => import('../admin/layouts/AdminLayout'))
const AdminHomePage = lazy(() => import('../admin/pages/AdminHomePage'))
const AdminPlaceholderPage = lazy(() => import('../admin/pages/AdminPlaceholderPage'))
const AdminCategoriesPage = lazy(() => import('../admin/pages/AdminCategoriesPage'))
const AdminProductsPage = lazy(() => import('../admin/pages/AdminProductsPage'))
const AdminProductCreatePage = lazy(() => import('../admin/pages/AdminProductCreatePage'))
const AdminProductEditPage = lazy(() => import('../admin/pages/AdminProductEditPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'categoria/:slug', element: <CategoryPage />, handle: { fullWidth: true } },
      { path: 'producto/:id', element: <ProductDetailPage />, handle: { fullWidth: true } },

      // Rutas para cualquier usuario con sesión
      {
        element: <RequireAuth />,
        children: [
          {
            path: 'cuenta',
            element: <AccountLayout />,
            children: [
              // "/cuenta" sola redirige a "/cuenta/perfil"
              { index: true, element: <AccountHomePage /> },
              { path: 'perfil', element: <ProfilePage /> },
              { path: 'perfil/editar', element: <ProfileEditPage /> },
              { path: 'direcciones', element: <AddressesPage /> },
              { path: 'direcciones/nueva', element: <AddressCreatePage /> },
              { path: 'direcciones/:id/editar', element: <AddressEditPage /> },
              { path: 'autenticacion', element: <AuthenticationPage /> },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
  
  // ─── Panel de administración: fuera del layout de la tienda ───
  {
    path: '/admin',
    element: (
      <Suspense fallback={<p className="p-6 text-sm text-ink-muted">Cargando panel...</p>}>
        <AdminLayout />
      </Suspense>
    ),
    children: [
      { index: true, element: <AdminHomePage /> },
      { path: 'productos', element: <AdminProductsPage /> },
      { path: 'productos/nuevo', element: <AdminProductCreatePage /> },
      { path: 'productos/:id', element: <AdminProductEditPage /> },
      { path: 'categorias', element: <AdminCategoriesPage /> },
      { path: 'pedidos', element: <AdminPlaceholderPage title="Pedidos" /> },
    ],
  },
])