'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { type FavoriteParking, useFavorites } from '@/shared/hooks/useFavorites'

export type FavoritesSort = 'recent' | 'name'

export function useFavoritesViewModel() {
  const router = useRouter()
  const { favorites, hydrated, remove, clear } = useFavorites()
  const [sort, setSort] = useState<FavoritesSort>('recent')
  const [confirmClear, setConfirmClear] = useState(false)

  const sorted = [...favorites].sort((a, b) =>
    sort === 'recent' ? b.addedAt - a.addedAt : a.name.localeCompare(b.name, 'ko')
  )

  const goToParking = useCallback(
    (f: FavoriteParking) => {
      router.push(f.isPartner ? `/p/${f.seq}` : `/parking/${f.seq}`)
    },
    [router]
  )

  const goToMap = useCallback(() => {
    router.push('/map')
  }, [router])

  const handleClear = useCallback(() => {
    clear()
    setConfirmClear(false)
  }, [clear])

  return {
    favorites: sorted,
    isEmpty: hydrated && favorites.length === 0,
    hydrated,
    sort,
    setSort,
    confirmClear,
    setConfirmClear,
    goToParking,
    goToMap,
    remove,
    handleClear
  }
}
