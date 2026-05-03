'use client'

import { useCallback, useState } from 'react'

const STORAGE_KEY = 'modu_recent_searches'
const MAX_ITEMS = 10

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function addRecentSearch(keyword: string) {
  const trimmed = keyword.trim()
  if (!trimmed || trimmed.length < 2) return
  const prev = getRecentSearches().filter((k) => k !== trimmed)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([trimmed, ...prev].slice(0, MAX_ITEMS)))
}

function removeRecentSearchItem(keyword: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getRecentSearches().filter((k) => k !== keyword)))
}

function clearAllRecentSearches() {
  localStorage.removeItem(STORAGE_KEY)
}

export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>(() => getRecentSearches())

  const refresh = useCallback(() => {
    setSearches(getRecentSearches())
  }, [])

  const remove = useCallback((keyword: string) => {
    removeRecentSearchItem(keyword)
    setSearches(getRecentSearches())
  }, [])

  const clear = useCallback(() => {
    clearAllRecentSearches()
    setSearches([])
  }, [])

  return { searches, refresh, remove, clear }
}
