import { useOtpLogin } from '../hooks/useOtpLogin'
import EmailForm from './EmailForm'
import CodeForm from './CodeForm'

function OtpLogin() {
  const {
    step,
    email,
    session,
    isLoading,
    error,
    sendCode,
    verifyCode,
    resendCode,
    changeEmail,
  } = useOtpLogin()

  if (step === 'email') {
    return (
      <EmailForm
        isLoading={isLoading}
        error={error}
        onSubmit={sendCode}
      />
    )
  }

  if (step === 'code') {
    return (
      <CodeForm
        email={email}
        isLoading={isLoading}
        error={error}
        onSubmit={verifyCode}
        onResend={resendCode}
        onChangeEmail={changeEmail}
      />
    )
  }

  // Paso 'done': temporal, en el paso 5 la sesión se guardará en Context
  return (
    <div>
      <p>Bienvenido, {session?.email}</p>
      <p>Rol: {session?.rol}</p>
    </div>
  )
}

export default OtpLogin