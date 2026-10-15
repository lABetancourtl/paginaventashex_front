import { useLogin } from '../hooks/useLogin'
import EmailForm from './EmailForm'
import CodeForm from './CodeForm'
import PasswordForm from './PasswordForm'

function LoginPanel() {
  const {
    method,
    step,
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
  } = useLogin()

  // ─── Método: contraseña ───────────────────────────────────
  if (method === 'password') {
    return (
      <PasswordForm
        isLoading={isLoading}
        error={error}
        suggestOtp={suggestOtp}
        onSubmit={submitPassword}
        onUseOtp={switchToOtp}
      />
    )
  }

  // ─── Método: OTP, paso del email ──────────────────────────
  if (step === 'email' || otpSentAt === null) {
    return (
      <div>
        <EmailForm
          initialEmail={email}
          isLoading={isLoading}
          error={error}
          onSubmit={sendCode}
        />
        <button type="button" onClick={switchToPassword} disabled={isLoading}>
          Ingresar con contraseña
        </button>
      </div>
    )
  }

  // ─── Método: OTP, paso del código ─────────────────────────
  return (
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

export default LoginPanel