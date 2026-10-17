export interface Departamento {
  codigo: number
  nombre: string
}

// Municipio tal como lo retorna GET /api/geography/departamentos/{codigo}/municipios
export interface Municipio {
  codigo: number
  nombre: string
  departamentoCodigo: number
}