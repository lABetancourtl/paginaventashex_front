import Modal from '../../../components/Modal'
import { useAuth } from '../hooks/useAuth'
import LoginPanel from './LoginPanel'

function LoginModal() {
  const { isLoginOpen, closeLogin } = useAuth()

  return (
    <Modal isOpen={isLoginOpen} onClose={closeLogin} ariaLabel="Iniciar sesión">
      <LoginPanel />
    </Modal>
  )
}

export default LoginModal