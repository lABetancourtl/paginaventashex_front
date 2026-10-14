import { useOtpLogin } from '../hooks/useOtpLogin'
import EmailForm from './EmailForm'

function OtpLogin() {
  const { step, email, isLoading, error, sendCode } = useOtpLogin()

  if (step === 'email') {
    return (
      <EmailForm
        isLoading={isLoading}
        error={error}
        onSubmit={sendCode}
      />
    )
  }

  // Paso 'code': temporal, en el paso 4 aquí irá el formulario del código
  return <p>Te enviamos un código a {email}. Revisa tu correo.</p>
}

export default OtpLogin