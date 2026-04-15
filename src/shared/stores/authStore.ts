import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { UserProfile } from '@/shared/types/auth'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  userVerificationId: string | null
  isLoggedIn: boolean
  profile: UserProfile | null
  setTokens: (accessToken: string, refreshToken: string, userVerificationId?: string) => void
  setProfile: (profile: UserProfile) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userVerificationId: null,
      isLoggedIn: false,
      profile: null,
      setTokens: (accessToken, refreshToken, userVerificationId) =>
        set({ accessToken, refreshToken, userVerificationId: userVerificationId ?? null, isLoggedIn: true }),
      setProfile: (profile) => set({ profile }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, userVerificationId: null, isLoggedIn: false, profile: null })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
