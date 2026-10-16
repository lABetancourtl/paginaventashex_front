import { createBrowserRouter } from 'react-router'
import MainLayout from '../layouts/MainLayout'
import RequireAuth from './RequireAuth'
import HomePage from '../pages/HomePage'
import ProfilePage from '../pages/ProfilePage'
import AdminPage from '../pages/AdminPage'
import NotFoundPage from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // Página de inicio: "/"
      { index: true, element: <HomePage /> },

      // Rutas para cualquier usuario con sesión
      {
        element: <RequireAuth />,
        children: [
          { path: 'perfil', element: <ProfilePage /> },
        ],
      },

      // Rutas solo para Admin
      {
        element: <RequireAuth role="Admin" />,
        children: [
          { path: 'admin', element: <AdminPage /> },
        ],
      },

      // Cualquier otra URL
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])