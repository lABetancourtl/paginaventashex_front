import type { Genero } from './types'

// Texto que ve el usuario para cada valor del enum
export const GENERO_LABELS: Record<Genero, string> = {
  Masculino: 'Masculino',
  Femenino: 'Femenino',
  PrefieroNoDecir: 'Prefiero no decir',
}

// Orden en que aparecen en el select
export const GENERO_VALUES: Genero[] = ['Masculino', 'Femenino', 'PrefieroNoDecir']