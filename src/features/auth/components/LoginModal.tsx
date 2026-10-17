import Modal from '../../../components/Modal'
import ModalTopBar from '../../../components/ModalTopBar'
import { useAuth } from '../hooks/useAuth'
import LoginPanel from './LoginPanel'

function LoginModal() {
  const { isLoginOpen, closeLogin } = useAuth()

  return (
    <Modal
      isOpen={isLoginOpen}
      onClose={closeLogin}
      ariaLabel="Iniciar sesión"
      topBar={<ModalTopBar onClose={closeLogin}>Tisoro</ModalTopBar>}
    >
      <LoginPanel />
    </Modal>
  )
}

export default LoginModal