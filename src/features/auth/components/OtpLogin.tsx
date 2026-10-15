import { useOtpLogin } from '../hooks/useOtpLogin'
import EmailForm from './EmailForm'
import CodeForm from './CodeForm'

function OtpLogin() {
  const {
    step,
    email,
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

export default OtpLogin