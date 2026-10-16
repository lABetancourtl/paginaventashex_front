import { apiGet, apiPut } from '../../../api/client'
import type { Profile, UpdateProfileRequest } from '../types'

export function getProfile(): Promise<Profile> {
  return apiGet<Profile>('/profile')
}

export async function updateProfile(request: UpdateProfileRequest): Promise<void> {
  await apiPut<unknown>('/profile', request)
}