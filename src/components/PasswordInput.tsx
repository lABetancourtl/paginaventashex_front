import { useState } from 'react'
import type { ComponentProps } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { inputClass } from './formStyles'

// Acepta las mismas props que un <input>, excepto type y className
type PasswordInputProps = Omit<ComponentProps<'input'>, 'type' | 'className'>

function PasswordInput({ disabled, ...inputProps }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...inputProps}
        type={isVisible ? 'text' : 'password'}
        disabled={disabled}
        // Evita que el celular cambie mayúsculas o corrija la contraseña visible
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className={`${inputClass} pr-12`}
      />

      <button
        type="button"
        onClick={() => setIsVisible((prev) => !prev)}
        disabled={disabled}
        aria-label="Mostrar contraseña"
        aria-pressed={isVisible}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted hover:text-ink disabled:opacity-60"
      >
        {isVisible ? (
          <EyeOff size={20} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Eye size={20} strokeWidth={1.5} aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

export default PasswordInput