// Estilo "infantil suave" de Mi cuenta (Perfil · Direcciones · Autenticación)

// Tarjeta de contenido: blanca, redondeada y con un borde cálido muy suave
export const accountCardClass = 'rounded-xl border border-card-line bg-white px-6 py-6 md:px-8 md:py-7'

// Acción con aspecto de enlace (Editar, Usar como principal)
export const accountLinkClass = [
  'text-[0.625rem] font-bold uppercase tracking-wider text-footer underline underline-offset-2',
  'hover:opacity-75',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')

// Botón principal (Añadir dirección, Modificar contraseña)
export const accountPrimaryButtonClass = [
  'inline-flex h-10 items-center justify-center rounded-lg bg-footer px-5',
  'text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-white',
  'hover:opacity-90',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ')
