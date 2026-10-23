// Botón principal del panel (ej: "Nueva categoría")
export const adminPrimaryButtonClass = [
  'inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white',
  'hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60',
].join(' ')

// Botón secundario del panel (acciones en filas y tarjetas)
export const adminSecondaryButtonClass = [
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-medium',
  'hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60',
].join(' ')