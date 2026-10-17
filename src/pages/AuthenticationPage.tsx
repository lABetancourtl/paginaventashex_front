import { useState } from 'react'
import { CircleCheck } from 'lucide-react'
import BackHeader from '../components/BackHeader'
import { primaryButtonClass } from '../components/formStyles'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useSendOtp } from '../features/auth/hooks/useSendOtp'
import { useProfile } from '../features/profile/hooks/useProfile'
import { useSetPassword } from '../features/profile/hooks/useSetPassword'
import NewPasswordForm from '../features/profile/components/NewPasswordForm'
import type { SetPasswordRequest } from '../features/profile/types'
import AccountSectionHeader from '../features/account/components/AccountSectionHeader'

type Mode = 'view' | 'set' | 'change'

function AuthenticationPage() {
  const { session } = useAuth()
  const { data: profile, isPending, error } = useProfile()
  const setPassword = useSetPassword()
  const sendOtp = useSendOtp()

  const [mode, setMode] = useState<Mode>('view')
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const email = session?.email ?? ''

  // ─── Acciones ─────────────────────────────────────────────

  // Envía el código y, cuando llega, muestra el formulario del modo indicado
  const requestCode = (nextMode: 'set' | 'change') => {
    sendOtp.mutate(email, {
      onSuccess: () => {
        setOtpSentAt(Date.now())
        setMode(nextMode)
      },
    })
  }

  const startSet = () => {
    setSuccessMessage(null)
    setPassword.reset()
    requestCode('set')
  }

  const startChange = () => {
    setSuccessMessage(null)
    setPassword.reset()
    requestCode('change')
  }

  const cancel = () => {
    setPassword.reset()
    setMode('view')
  }

  const handleSubmit = (request: SetPasswordRequest) => {
    setPassword.mutate(request, {
      onSuccess: () => {
        setSuccessMessage(
          mode === 'set' ? 'Tu contraseña quedó definida.' : 'Tu contraseña se actualizó.',
        )
        setMode('view')
      },
    })
  }

  // ─── Estados de carga ─────────────────────────────────────
  if (isPending) {
    return <p className="text-ink-muted">Cargando...</p>
  }

  if (error) {
    return <p className="text-danger">{error.message}</p>
  }

  // ─── Formulario (definir o modificar) ─────────────────────
  if (mode !== 'view') {
    return (
      <section>
        <BackHeader
          title={mode === 'set' ? 'Definir contraseña' : 'Modificar contraseña'}
          backLabel="Cancelar y volver"
          onBack={cancel}
        />

        <div className="border border-line p-6 md:p-10">
          <p className="mb-6 text-sm text-ink-muted">
            Enviamos un código a{' '}
            <strong className="break-all font-semibold text-ink">{email}</strong>. Escríbelo
            junto con tu nueva contraseña.
          </p>

          <NewPasswordForm
            key={mode}
            email={email}
            requiresCode
            otpSentAt={otpSentAt}
            isSaving={setPassword.isPending}
            isResending={sendOtp.isPending}
            serverError={setPassword.error?.message ?? sendOtp.error?.message ?? null}
            onSubmit={handleSubmit}
            onResend={() => requestCode(mode)}
            onCancel={cancel}
          />
        </div>
      </section>
    )
  }

  // ─── Vista ────────────────────────────────────────────────
  return (
    <section>
      <AccountSectionHeader title="Autenticación" desktopTitle />

      <div className="border border-line p-6 md:p-10">
        <h3 className="font-semibold">Contraseña</h3>

        {profile.tienePassword ? (
          <p className="mt-1 text-ink-muted">
            <span aria-hidden="true">••••••••••••</span>
            <span className="sr-only">Tienes una contraseña definida.</span>
          </p>
        ) : (
          <p className="mt-1 text-ink-muted">Todavía no tienes una contraseña definida.</p>
        )}

        {successMessage && (
          <p role="status" className="mt-4 flex items-center gap-2 text-sm font-medium">
            <CircleCheck size={18} strokeWidth={1.5} aria-hidden="true" />
            {successMessage}
          </p>
        )}

        {sendOtp.error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {sendOtp.error.message}
          </p>
        )}

        <button
          type="button"
          onClick={profile.tienePassword ? startChange : startSet}
          disabled={sendOtp.isPending}
          className={`${primaryButtonClass} mt-6 sm:w-80`}
        >
          {sendOtp.isPending
            ? 'Enviando código...'
            : profile.tienePassword
              ? 'Modificar contraseña'
              : 'Definir contraseña'}
        </button>
      </div>
    </section>
  )
}

export default AuthenticationPage