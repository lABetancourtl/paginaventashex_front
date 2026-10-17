import { createBrowserRouter, Navigate } from 'react-router'
import MainLayout from '../layouts/MainLayout'
import AccountLayout from '../layouts/AccountLayout'
import RequireAuth from './RequireAuth'
import HomePage from '../pages/HomePage'
import ProfilePage from '../pages/ProfilePage'
import ProfileEditPage from '../pages/ProfileEditPage'
import AddressesPage from '../pages/AddressesPage'
import AuthenticationPage from '../pages/AuthenticationPage'
import AdminPage from '../pages/AdminPage'
import NotFoundPage from '../pages/NotFoundPage'
import AddressCreatePage from '../pages/AddressCreatePage'
import AddressEditPage from '../pages/AddressEditPage'
import AccountHomePage from '../pages/AccountHomePage'
import CategoryPage from '../pages/CategoryPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'categoria/:slug', element: <CategoryPage /> },

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

      // Rutas solo para Admin
      {
        element: <RequireAuth role="Admin" />,
        children: [
          { path: 'admin', element: <AdminPage /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])