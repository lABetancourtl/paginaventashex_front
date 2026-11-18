interface AdminSwitchProps {
  checked: boolean
  disabled?: boolean
  label: string // Para lectores de pantalla (ej: "Desactivar producto")
  size?: 'sm' | 'md'
  onChange: () => void
}

// Interruptor de encendido/apagado
function AdminSwitch({ checked, disabled = false, label, size = 'md', onChange }: AdminSwitchProps) {
  const track = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11'
  const knob = size === 'sm' ? 'size-4' : 'size-5'
  const on = size === 'sm' ? 'translate-x-[18px]' : 'translate-x-[22px]'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex ${track} shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? 'bg-admin-success' : 'bg-ink/15 hover:bg-ink/25'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block ${knob} rounded-full bg-white shadow transition-transform ${
          checked ? on : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default AdminSwitch
