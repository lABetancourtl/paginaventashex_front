// ─── Botones ─────────────────────────────────────────────────

// Botón principal del panel (ej: "Nueva categoría")
export const adminPrimaryButtonClass = [
  'inline-flex items-center justify-center gap-2 rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-white',
  'shadow-sm shadow-admin-accent/20 transition-colors hover:bg-admin-accent-hover',
  'focus-visible:outline-admin-accent disabled:cursor-not-allowed disabled:opacity-60',
].join(' ')

// Botón secundario del panel (fondo blanco con borde)
export const adminSecondaryButtonClass = [
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-line bg-white px-3.5 py-2 text-sm font-medium text-ink',
  'transition-colors hover:border-ink/20 hover:bg-admin-bg',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ')

// Botón secundario pequeño, para paneles (ej: "↑ Subir", "+ Agregar")
export const adminSmallButtonClass = [
  'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-admin-line bg-white px-2.5 text-xs font-medium text-ink',
  'transition-colors hover:bg-admin-bg',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')

// Botón destructivo (ej: confirmar "Desactivar")
export const adminDangerButtonClass = [
  'inline-flex items-center justify-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white',
  'transition-colors hover:bg-danger/90',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ')

// Botón cuadrado solo con ícono (acciones de filas)
export const adminIconButtonClass = [
  'inline-flex size-8 items-center justify-center rounded-lg text-ink-muted transition-colors',
  'hover:bg-admin-bg hover:text-ink',
  'disabled:cursor-not-allowed disabled:opacity-40',
].join(' ')

// ─── Campos de formulario ────────────────────────────────────

export const adminInputClass = [
  'block w-full rounded-lg border border-admin-line bg-white px-3 py-2.5 text-sm text-ink',
  'placeholder:text-ink-muted/60 transition-[border-color,box-shadow]',
  'hover:border-ink/25',
  'focus:border-admin-accent focus:outline-none focus:ring-4 focus:ring-admin-accent/10',
  'disabled:cursor-not-allowed disabled:bg-admin-bg disabled:opacity-70',
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/10',
].join(' ')

// Campos que se muestran pero no se editan
export const adminReadOnlyClass = [
  'block w-full cursor-default rounded-lg border border-admin-line bg-admin-bg px-3 py-2.5 text-sm text-ink-muted',
].join(' ')

// ─── Tablas ──────────────────────────────────────────────────

// Encabezado de columna: mayúsculas pequeñas y espaciadas
export const adminThClass =
  'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted whitespace-nowrap'

export const adminTdClass = 'px-4 py-3.5 align-middle'
