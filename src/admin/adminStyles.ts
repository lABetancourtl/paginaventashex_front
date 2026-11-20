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

// ─── Menús desplegables ──────────────────────────────────────

// Panel flotante: bordes suaves, sombra amplia y relleno de 6px
export const adminMenuPanelClass = [
  'z-40 animate-admin-fade rounded-xl border border-admin-line bg-white p-1.5',
  'shadow-[0_12px_32px_rgb(28_28_26/0.12)] focus:outline-none',
].join(' ')

// Opción simple de un menú (ícono + texto)
export const adminMenuItemClass = [
  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-admin-ink',
  'data-focus:bg-admin-hover data-disabled:cursor-not-allowed data-disabled:opacity-50',
].join(' ')

// Recuadro del ícono en las opciones con descripción (menú "Crear")
export const adminMenuIconTileClass =
  'flex size-8 shrink-0 items-center justify-center rounded-lg bg-admin-hover text-[#3d3c38]'

// ─── Detalle de producto (estilo Tisoro) ─────────────────────

// Tarjeta de sección: borde suave, radio de 14px y sin sombra
export const adminPanelClass = 'rounded-[14px] border border-admin-line bg-white'

// Botón con borde: 44px en celular, 36px en computador
export const adminOutlineButtonClass = [
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#dcdbd6] bg-white px-3.5',
  'text-[13px] font-medium text-admin-ink transition-colors hover:border-[#cbcac4] hover:bg-admin-bg md:h-9',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')

// Botón sin borde (acciones secundarias)
export const adminGhostButtonClass = [
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3',
  'text-[13px] font-medium text-[#3d3c38] transition-colors hover:bg-admin-hover md:h-9',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')

// Botón principal azul de la cabecera y de la barra de guardado
export const adminSolidButtonClass = [
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[9px] bg-admin-accent px-4',
  'text-sm font-medium text-white transition-colors hover:bg-admin-accent-hover md:h-9',
  'disabled:cursor-not-allowed disabled:bg-admin-active disabled:text-[#9a9993]',
].join(' ')

// Campo de texto de 40px
export const adminTextFieldClass = [
  'block w-full rounded-[9px] border border-[#e2e1dc] bg-white px-3 text-sm text-admin-ink',
  'placeholder:text-[#9a9993] transition-[border-color,box-shadow] hover:border-[#cbcac4]',
  'focus:border-admin-accent focus:outline-none focus:ring-4 focus:ring-admin-accent/10',
  'disabled:cursor-not-allowed disabled:opacity-60',
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/10',
].join(' ')

// Pastilla con un número (ej: "Stock total: 12")
export const adminCountChipClass =
  'whitespace-nowrap rounded-[10px] bg-admin-hover px-2 py-0.5 text-xs font-medium tabular-nums text-[#4a4945]'

// Botón rojo de confirmación (eliminar, ocultar) en el estilo Tisoro
export const adminDangerSolidButtonClass = [
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[9px] bg-[#b42318] px-4',
  'text-sm font-medium text-white transition-colors hover:bg-[#9a1d13] md:h-9',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ')

// Rayas de fondo de los bloques vacíos de la vista previa de la página de inicio
export const stripedTileClass =
  'bg-[repeating-linear-gradient(135deg,var(--color-admin-line)_0_5px,var(--color-admin-bg)_5px_10px)]'
