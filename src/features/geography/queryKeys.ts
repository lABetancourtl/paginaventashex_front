export const geographyKeys = {
  departamentos: ['geography', 'departamentos'] as const,
  // Una clave distinta por cada departamento
  municipios: (departamentoCodigo: number) =>
    ['geography', 'municipios', departamentoCodigo] as const,
}