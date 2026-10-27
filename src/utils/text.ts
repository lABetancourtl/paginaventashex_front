// Quita tildes, pasa a minúsculas y elimina espacios en los extremos.
// "Bogotá, D.C." → "bogota, d.c."
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// "Pijamas de Niño" → "pijamas-de-nino"
export function slugify(text: string): string {
  return normalizeText(text)
    .replace(/[^a-z0-9]+/g, '-') // Todo lo que no sea letra o número se vuelve guion
    .replace(/^-+|-+$/g, '')      // Sin guiones al inicio ni al final
}

// Singular aproximado de un nombre de categoría en español.
// "Camisetas" → "Camiseta", "Bodys" → "Body", "Pantalones" → "Pantalón"
// Ideal a futuro: que el backend envíe el singular de cada categoría.
export function toSingular(plural: string): string {
  if (plural.endsWith('ones')) return `${plural.slice(0, -4)}ón`
  if (plural.endsWith('s')) return plural.slice(0, -1)
  return plural
}