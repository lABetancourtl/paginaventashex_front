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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },

      // Rutas para cualquier usuario con sesión
      {
        element: <RequireAuth />,
        children: [
          {
            path: 'cuenta',
            element: <AccountLayout />,
            children: [
              // "/cuenta" sola redirige a "/cuenta/perfil"
              { index: true, element: <Navigate to="perfil" replace /> },
              { path: 'perfil', element: <ProfilePage /> },
              { path: 'perfil/editar', element: <ProfileEditPage /> },
              { path: 'direcciones', element: <AddressesPage /> },
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