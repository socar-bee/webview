'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { fetchSearchPlace, type SearchPlace } from '../model'

export function useSearchViewModel() {
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  const [results, setResults] = useState<SearchPlace[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
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
