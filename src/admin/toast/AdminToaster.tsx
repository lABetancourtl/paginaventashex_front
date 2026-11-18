import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { ToastContext } from './toastContext'
import type { ToastOptions, ToastTone } from './toastContext'

interface Toast extends ToastOptions {
  id: number
}

const MAX_TOASTS = 3
const DEFAULT_DURATION_MS = 4000

const toneStyles: Record<ToastTone, { icon: typeof Info; color: string }> = {
  success: { icon: CheckCircle2, color: 'text-green-600' },
  error: { icon: AlertCircle, color: 'text-danger' },
  info: { icon: Info, color: 'text-admin-accent' },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const { icon: Icon, color } = toneStyles[toast.tone ?? 'success']
  const timerRef = useRef<number | undefined>(undefined)
  const onClose = useCallback(() => onDismiss(toast.id), [onDismiss, toast.id])

  const start = useCallback(() => {
    // Los errores y los que tienen acción duran un poco más
    const duration = toast.durationMs ?? (toast.action || toast.tone === 'error' ? 7000 : DEFAULT_DURATION_MS)
    timerRef.current = window.setTimeout(onClose, duration)
  }, [toast, onClose])

  useEffect(() => {
    start()
    return () => window.clearTimeout(timerRef.current)
  }, [start])

  return (
    <li
      role={toast.tone === 'error' ? 'alert' : 'status'}
      // Al pasar el mouse se pausa, para alcanzar a leerlo o pulsar "Deshacer"
      onMouseEnter={() => window.clearTimeout(timerRef.current)}
      onMouseLeave={start}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-admin-line bg-white px-4 py-3 text-sm shadow-lg shadow-ink/10 animate-admin-pop sm:w-96"
    >
      <Icon size={18} strokeWidth={1.75} aria-hidden="true" className={`mt-px shrink-0 ${color}`} />
      <p className="flex-1 text-ink">{toast.message}</p>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick()
            onClose()
          }}
          className="shrink-0 font-semibold text-admin-accent hover:underline"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar aviso"
        className="-mr-1 shrink-0 rounded-md p-0.5 text-ink-muted hover:bg-admin-bg hover:text-ink"
      >
        <X size={15} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </li>
  )
}

// Avisos flotantes del panel (abajo a la derecha; abajo al centro en celular)
function AdminToaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const show = useCallback((options: ToastOptions) => {
    const id = ++nextId.current
    setToasts((prev) => [...prev, { ...options, id }].slice(-MAX_TOASTS))
  }, [])

  const close = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext value={show}>
      {children}
      <ol
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={close} />
        ))}
      </ol>
    </ToastContext>
  )
}

export default AdminToaster
