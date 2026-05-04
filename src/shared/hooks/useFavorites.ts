'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'modu_favorites'
const MAX_ITEMS = 100

export interface FavoriteParking {
  seq: number
  name: string
  areaLabel?: string
  image?: string
  /** 추가 시각 (정렬용 ms epoch) */
  addedAt: number
  /** /p/[seq] 제휴주차장 / /parking/[seq] 공영 — 라우트 분기용 */
  isPartner?: boolean
}

function read(): FavoriteParking[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as FavoriteParking[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(items: FavoriteParking[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}

// 같은 탭 내 다른 컴포넌트 간 즉시 동기화를 위한 pub-sub
const subscribers = new Set<() => void>()
function notifyAll() {
  subscribers.forEach((fn) => fn())
}

export function addFavorite(parking: Omit<FavoriteParking, 'addedAt'>) {
  const items = read().filter((f) => f.seq !== parking.seq)
  write([{ ...parking, addedAt: Date.now() }, ...items])
  notifyAll()
}

export function removeFavorite(seq: number) {
  write(read().filter((f) => f.seq !== seq))
  notifyAll()
}

export function isFavorite(seq: number): boolean {
  return read().some((f) => f.seq === seq)
}

export function clearFavorites() {
  localStorage.removeItem(STORAGE_KEY)
  notifyAll()
}

/** SSR/hydration 안전: 마운트 후 localStorage 읽음 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteParking[]>([])
  const [hydrated, setHydrated] = useState(false)

  // localStorage는 클라이언트 전용 → mount 후 1회 hydrate + 다른 인스턴스 변경 구독
  useEffect(() => {
    const refresh = () => setFavorites(read())

    refresh()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true)
    subscribers.add(refresh)
    // 다른 탭에서의 변경(localStorage 'storage' 이벤트)도 반영
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      subscribers.delete(refresh)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const refresh = useCallback(() => {
    setFavorites(read())
  }, [])

  // addFavorite/removeFavorite/clearFavorites가 notifyAll → 모든 구독자 setState. 별도 sync 불필요.
  const add = useCallback((parking: Omit<FavoriteParking, 'addedAt'>) => {
    addFavorite(parking)
  }, [])

  const remove = useCallback((seq: number) => {
    removeFavorite(seq)
  }, [])

  const toggle = useCallback((parking: Omit<FavoriteParking, 'addedAt'>): boolean => {
    const exists = read().some((f) => f.seq === parking.seq)
    if (exists) removeFavorite(parking.seq)
    else addFavorite(parking)
    return !exists
  }, [])

  const clear = useCallback(() => {
    clearFavorites()
  }, [])

  return { favorites, hydrated, refresh, add, remove, toggle, clear }
}
