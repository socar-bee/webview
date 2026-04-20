import apiClient from '@/shared/lib/apiClient'

import type { LoginRequest, LoginResponse, SocialLoginRequest, UserProfile } from '@/shared/types/auth'

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<{ data: LoginResponse }>('/login', body)
  return data.data
}

export async function socialLogin(body: SocialLoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<{ data: LoginResponse }>('/login/social', body)
  return data.data
}

export async function getProfile(token: string): Promise<UserProfile> {
  const { data } = await apiClient.get<{ data: UserProfile }>('/user/profile', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data.data
}
