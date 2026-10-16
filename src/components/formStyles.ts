// Inputs, selects y campos de fecha
export const inputClass = [
  'block w-full border border-ink/60 bg-surface px-4 py-3 text-ink',
  'placeholder:text-ink-muted/70',
  'focus:border-ink',
  'disabled:cursor-not-allowed disabled:opacity-60',
  'aria-[invalid=true]:border-danger',
].join(' ')

// Campos que se muestran pero no se pueden editar (ej: el email)
export const readOnlyInputClass = [
  'block w-full border border-line bg-canvas px-4 py-3 text-ink-muted',
  'cursor-default',
].join(' ')

// Botón de acción principal (fondo oscuro)
export const primaryButtonClass = [
  'w-full bg-primary px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white',
  'hover:bg-primary-hover',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ')

// NUEVO: botón secundario (solo borde)
export const secondaryButtonClass = [
  'w-full border border-ink/60 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-ink',
  'hover:bg-canvas',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ')

// NUEVO: acción con aspecto de enlace (ej: "Reenviar código")
export const linkButtonClass = [
  'text-sm font-medium text-ink underline underline-offset-4',
  'hover:text-ink-muted',
  'disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60',
].join(' ')