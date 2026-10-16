import { Mail, User } from 'lucide-react'

interface MethodChooserProps {
  onChooseOtp: () => void
  onChoosePassword: () => void
}

const optionClass = [
  'flex w-full items-center gap-4 border border-ink/60 px-5 py-3.5 text-left',
  'text-sm font-semibold uppercase tracking-wide hover:bg-canvas',
].join(' ')

function MethodChooser({ onChooseOtp, onChoosePassword }: MethodChooserProps) {
  return (
    <ul className="space-y-3">
      <li>
        <button type="button" onClick={onChooseOtp} className={optionClass}>
          <Mail size={20} strokeWidth={1.5} aria-hidden="true" />
          <span>Recibir código de acceso por email</span>
        </button>
      </li>
      <li>
        <button type="button" onClick={onChoosePassword} className={optionClass}>
          <User size={20} strokeWidth={1.5} aria-hidden="true" />
          <span>Ingresar con email y contraseña</span>
        </button>
      </li>
    </ul>
  )
}

export default MethodChooser