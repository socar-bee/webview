import apiClient from '@/shared/lib/apiClient'

import type { LoginRequest, LoginResponse, UserProfile } from '@/shared/types/auth'

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<{ data: LoginResponse }>('/user/login', body)
  return data.data
}

export async function getProfile(token: string): Promise<UserProfile> {
  const { data } = await apiClient.get<{ data: UserProfile }>('/user/profile', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data.data
}
