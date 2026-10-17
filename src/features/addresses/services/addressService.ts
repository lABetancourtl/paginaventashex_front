import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../../../api/client'
import type { Address, AddressRequest } from '../types'

export function getAddresses(): Promise<Address[]> {
  return apiGet<Address[]>('/profile/addresses')
}

export function createAddress(request: AddressRequest): Promise<number> {
  return apiPost<number>('/profile/addresses', request)
}

export async function updateAddress(id: number, request: AddressRequest): Promise<void> {
  await apiPut<boolean>(`/profile/addresses/${id}`, request)
}

export async function deleteAddress(id: number): Promise<void> {
  await apiDelete<boolean>(`/profile/addresses/${id}`)
}

export async function setPrincipalAddress(id: number): Promise<void> {
  await apiPatch<boolean>(`/profile/addresses/${id}/principal`)
}