const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

// Para DateTime con hora y zona (ej: "2026-09-17T03:44:59Z")
export function formatDateTime(isoDateTime: string): string {
  return dateFormatter.format(new Date(isoDateTime))
}

// Para DateOnly sin hora (ej: "2000-05-10")
export function formatDateOnly(dateOnly: string): string {
  const [year, month, day] = dateOnly.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}

// NUEVO: nombre para saludar al usuario.
// Usa el nombre si existe; si no, la parte del email antes de la @
export function getDisplayName(nombre: string | null | undefined, email: string): string {
  if (nombre && nombre.trim() !== '') {
    return nombre.trim()
  }
  return email.split('@')[0]
}