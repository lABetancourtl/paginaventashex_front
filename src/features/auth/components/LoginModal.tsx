import Modal from '../../../components/Modal'
import { useAuth } from '../hooks/useAuth'
import OtpLogin from './OtpLogin'

function LoginModal() {
  const { isLoginOpen, closeLogin } = useAuth()

  return (
    <Modal isOpen={isLoginOpen} onClose={closeLogin} ariaLabel="Iniciar sesión">
      <OtpLogin />
    </Modal>
  )
}

export default LoginModal