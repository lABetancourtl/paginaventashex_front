import type { SizeGroup } from './types'

// El backend los envía sin tilde ni ñ; en pantalla se muestran bien escritos
export const SIZE_GROUP_LABELS: Record<SizeGroup, string> = {
  Bebe: 'Bebé',
  Nino: 'Niño',
  Adulto: 'Adulto',
}

export const SIZE_GROUP_VALUES = Object.keys(SIZE_GROUP_LABELS) as SizeGroup[]