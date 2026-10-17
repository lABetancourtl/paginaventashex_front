import { apiGet, apiPut } from '../../../api/client'
import type { Profile, SetPasswordRequest, UpdateProfileRequest } from '../types'

export function getProfile(): Promise<Profile> {
  return apiGet<Profile>('/profile')
}

export async function updateProfile(request: UpdateProfileRequest): Promise<void> {
  await apiPut<unknown>('/profile', request)
}

export async function setPassword(request: SetPasswordRequest): Promise<void> {
  await apiPut<boolean>('/profile/password', request)
}