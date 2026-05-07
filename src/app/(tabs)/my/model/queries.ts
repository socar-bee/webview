'use client'

import { useQuery } from '@tanstack/react-query'

import type { UserProfile } from '@/shared/types/auth'

import { getProfile } from '@/app/(tabs)/login/model/api'

export const myQueryKeys = {
  all: ['my'] as const,
  profile: (token: string | null) => [...myQueryKeys.all, 'profile', token ?? ''] as const
}

export function useProfile(accessToken: string | null, initial?: UserProfile | null) {
  return useQuery<UserProfile>({
    queryKey: myQueryKeys.profile(accessToken),
    queryFn: () => getProfile(accessToken as string),
    enabled: !!accessToken,
    staleTime: 60_000,
    initialData: initial ?? undefined
  })
}
