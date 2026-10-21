import { useSearchParams } from 'react-router'
import { SALE_PARAM } from '../catalogNav'

// ¿La URL actual tiene el filtro de ofertas?
export function useIsSaleView(): boolean {
  const [searchParams] = useSearchParams()
  return searchParams.get(SALE_PARAM) === '1'
}