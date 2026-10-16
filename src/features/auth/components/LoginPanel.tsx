import type { ReactNode } from 'react'
import { useLogin } from '../hooks/useLogin'
import LoginHeader from './LoginHeader'
import MethodChooser from './MethodChooser'
import EmailForm from './EmailForm'
import CodeForm from './CodeForm'
import PasswordForm from './PasswordForm'
import type { OtpIntent } from '../hooks/useLogin'

// Título y texto del paso del email según el motivo
const OTP_TEXTS: Record<OtpIntent, { title: string; description: string }> = {
  login: {
    title: 'Código de acceso por email',
    description: 'Te enviaremos un código para ingresar sin contraseña.',
  },
  register: {
    title: 'Crea tu cuenta',
    description: 'Te enviaremos un código a tu correo. Tu cuenta se crea al verificarlo.',
  },
  reset: {
    title: 'Recupera tu acceso',
    description:
      'Te enviaremos un código para ingresar. Después podrás asignar una nueva contraseña en Autenticación.',
  },
}

function LoginPanel() {
  const {
    method,
    step,
    otpIntent,
    email,
    otpSentAt,
    isLoading,
    error,
    suggestOtp,
    sendCode,
    verifyCode,
    resendCode,
    changeEmail,
    submitPassword,
    switchToPassword,
    switchToOtp,
    goBack,
  } = useLogin()

  // Según el paso, definimos el título, el contenido y si hay flecha
  let title: string
  let body: ReactNode
  let canGoBack = true

  if (method === 'choose') {
    title = 'Inicia sesión'
    canGoBack = false
    body = (
      <MethodChooser
        onChooseOtp={() => switchToOtp()}
        onChoosePassword={switchToPassword}
      />
    )
  } else if (method === 'password') {
    title = 'Ingresar con contraseña'
    body = (
      <PasswordForm
        isLoading={isLoading}
        error={error}
        suggestOtp={suggestOtp}
        onSubmit={submitPassword}
        onUseOtp={switchToOtp}
        onRegister={(typedEmail) => switchToOtp(typedEmail, 'register')}
        onForgotPassword={(typedEmail) => switchToOtp(typedEmail, 'reset')}
      />
    )
  } else if (step === 'email' || otpSentAt === null) {
    title = OTP_TEXTS[otpIntent].title
    body = (
      <EmailForm
        initialEmail={email}
        description={OTP_TEXTS[otpIntent].description}
        isLoading={isLoading}
        error={error}
        onSubmit={sendCode}
      />
    )
  } else {
    title = 'Ingresa el código'
    body = (
      <CodeForm
        email={email}
        otpSentAt={otpSentAt}
        isLoading={isLoading}
        error={error}
        onSubmit={verifyCode}
        onResend={resendCode}
        onChangeEmail={changeEmail}
      />
    )
  }

  return (
    <div>
      <LoginHeader
        title={title}
        onBack={canGoBack ? goBack : undefined}
        disabled={isLoading}
      />
      <div className="mx-auto w-full max-w-sm">{body}</div>
    </div>
  )
}

export default LoginPanel