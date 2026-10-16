import { ArrowLeft } from 'lucide-react'

interface LoginHeaderProps {
  title: string
  onBack?: () => void // Si no se envía, no hay flecha
  disabled?: boolean
}

function LoginHeader({ title, onBack, disabled = false }: LoginHeaderProps) {
  return (
    <div className="relative mb-8 flex min-h-10 items-center justify-center px-12">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={disabled}
          aria-label="Volver"
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 hover:text-ink-muted disabled:opacity-60"
        >
          <ArrowLeft size={22} strokeWidth={1.5} aria-hidden="true" />
        </button>
      )}

      <h2 className="text-center text-base font-extrabold uppercase tracking-wide md:text-lg">
        {title}
      </h2>
    </div>
  )
}

export default LoginHeader