import apiClient from '@/shared/lib/apiClient'

import type { LoginRequest, LoginResponse, SocialLoginRequest, UserProfile } from '@/shared/types/auth'

/**
 * 이메일 로그인
 * POST {baseURL}/user/login
 * Body: { email, pw, deviceType, deviceToken, version }
 * Response: { accessToken, refreshToken, userVerificationId? }
 */
export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<{ data: LoginResponse }>('/user/login', body)
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
