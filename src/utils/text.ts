// Quita tildes, pasa a minúsculas y elimina espacios en los extremos.
// "Bogotá, D.C." → "bogota, d.c."
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}