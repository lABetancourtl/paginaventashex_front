import { createContext, useContext } from 'react'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastOptions {
  tone?: ToastTone
  message: string
  action?: { label: string; onClick: () => void } // Ej: "Deshacer"
  durationMs?: number
}

export const ToastContext = createContext<((options: ToastOptions) => void) | null>(null)

// Muestra un aviso flotante del panel: useAdminToast()({ message: 'Guardado' })
export function useAdminToast() {
  const show = useContext(ToastContext)
  if (!show) throw new Error('useAdminToast debe usarse dentro de <AdminToaster>')
  return show
}
