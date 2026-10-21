// Botones de íconos del header (hamburguesa, usuario, buscar, carrito)
export const headerIconButtonClass = [
  'flex size-10 shrink-0 items-center justify-center rounded-full',
  'hover:bg-white/10',
  // Contorno blanco: el verde oliva no se vería sobre el header oscuro
  'focus-visible:outline-white',
].join(' ')

// Enlaces de la navegación principal en computador
export const headerNavLinkClass = [
  'text-xs font-bold uppercase tracking-wider text-white/85',
  'hover:text-white focus-visible:outline-white',
  'aria-[current=true]:text-white aria-[current=true]:underline aria-[current=true]:underline-offset-8',
].join(' ')

// Paneles que se despliegan desde el header
export const headerPanelClass = [
  // text-ink: los paneles son claros, aunque estén dentro del header oscuro
  'fixed inset-x-0 top-14 z-40 border-b border-white/10 text-white glass-dark',
  // Computador: pegado al borde derecho
  'md:left-auto md:w-72 md:border-l',
].join(' ')

// "Sale" en el header: verde claro sobre el fondo oscuro
export const headerSaleClass = [
  'text-xs font-bold uppercase tracking-wider text-sale',
  'hover:text-sale/80 focus-visible:outline-white',
  'aria-[current=true]:underline aria-[current=true]:underline-offset-8',
].join(' ')