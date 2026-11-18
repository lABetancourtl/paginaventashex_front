import { Navigate } from 'react-router'

// "/cuenta" sola lleva a Perfil: las pestañas de arriba sirven en celular y computador
function AccountHomePage() {
  return <Navigate to="/cuenta/perfil" replace />
}

export default AccountHomePage
