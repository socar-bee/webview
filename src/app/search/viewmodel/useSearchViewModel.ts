'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { addRecentSearch } from '@/shared/hooks/useRecentSearches'

import { fetchSearchPlace, type SearchPlace } from '../model'

export function useSearchViewModel(initialKeyword?: string) {
  const router = useRouter()
  const [searchText, setSearchText] = useState(initialKeyword ?? '')
  const [results, setResults] = useState<SearchPlace[] | null>(null)
  const [isSearching, setIsSearching] = useState(!!initialKeyword)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef(false)

  const doSearch = useCallback(async (query: string) => {
    abortRef.current = false
    try {
      const places = await fetchSearchPlace(query)
      if (!abortRef.current) {
        setResults(places)
        setIsSearching(false)
      }
    } catch {
      if (!abortRef.current) setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    if (initialKeyword && initialKeyword.length >= 2) {
      addRecentSearch(initialKeyword)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      doSearch(initialKeyword)
    }
  }, [initialKeyword, doSearch])

  const onChangeSearchText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchText(value)

      if (timerRef.current) clearTimeout(timerRef.current)
      abortRef.current = true

      if (value.length < 2) {
        setResults(null)
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      timerRef.current = setTimeout(() => doSearch(value), 500)
    },
    [doSearch]
  )

  const goBack = () => router.back()

  const selectPlace = (place: SearchPlace) => {
    if (searchText.trim().length >= 2) addRecentSearch(searchText.trim())
    router.push(`/map?lat=${place.latitude}&lng=${place.longitude}`)
  }

  return {
    searchText,
    results,
    isSearching,
    onChangeSearchText,
    goBack,
    selectPlace
  }
}
