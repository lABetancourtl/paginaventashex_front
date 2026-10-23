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