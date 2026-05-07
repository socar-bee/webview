'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'

import { useAuthStore } from '@/shared/stores/authStore'

import { useProfile } from '../model'

export function useMyViewModel() {
  const router = useRouter()
  const { accessToken, profile: storedProfile, isLoggedIn, setProfile, logout } = useAuthStore()

  const { data: profile, isLoading, isError, refetch } = useProfile(accessToken, storedProfile)

  // 최신 프로필을 store에도 동기화 → 다른 화면(닉네임 등)에서 즉시 반영
  useEffect(() => {
    if (profile && profile !== storedProfile) {
      setProfile(profile)
    }
    // storedProfile은 deps에서 의도적으로 제외 (무한 재호출 방지)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, setProfile])

  const handleLogout = useCallback(() => {
    logout()
    router.replace('/')
  }, [logout, router])

  const goTickets = useCallback(() => router.push('/tickets'), [router])
  const goFavorites = useCallback(() => router.push('/favorites'), [router])
  const goReviews = useCallback(() => router.push('/reviews'), [router])
  const goNotices = useCallback(() => {
    window.open('https://app.modu.kr/notice', '_blank')
  }, [])
  const goCustomerCenter = useCallback(() => {
    window.open('https://help.modu.kr', '_blank')
  }, [])

  return {
    isLoggedIn,
    profile: profile ?? null,
    isLoading,
    isError,
    refetch,
    handleLogout,
    goTickets,
    goFavorites,
    goReviews,
    goNotices,
    goCustomerCenter
  }
}
