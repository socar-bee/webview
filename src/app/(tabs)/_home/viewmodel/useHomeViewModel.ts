'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { PopularKeyword, PopularParking, RecommendedRegion, TopParking } from '../model'

import {
  useHeroBanners,
  usePopularKeywords,
  usePopularParkings,
  useQuickMenu,
  useRecommendedRegions,
  useTopParkings
} from '../model'

const HERO_AUTOPLAY_MS = 4500
const HERO_RESUME_DELAY_MS = 3000
const DEFAULT_LOCATION_LABEL = '서울'

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ko`,
    { headers: { 'Accept-Language': 'ko' } }
  )
  if (!res.ok) return DEFAULT_LOCATION_LABEL
  const data = await res.json()
  const { city_district, suburb, quarter, town, village } = data.address ?? {}
  const dong = suburb ?? quarter ?? town ?? village ?? ''
  const gu = city_district ?? ''
  return dong ? `현재 위치 · ${gu} ${dong}`.trim() : gu ? `현재 위치 · ${gu}` : '현재 위치'
}

export function useHomeViewModel() {
  const router = useRouter()
  const { data: banners = [] } = useHeroBanners()
  const { data: quickMenu = [] } = useQuickMenu()
  const { data: regions = [], isLoading: isRegionsLoading } = useRecommendedRegions()
  const { data: parkings = [], isLoading: isParkingsLoading } = usePopularParkings()
  const { data: topParkings = [], isLoading: isTopParkingsLoading } = useTopParkings()
  const { data: popularKeywords = [], isLoading: isPopularKeywordsLoading } = usePopularKeywords()

  const [heroIndex, setHeroIndex] = useState(0)
  const isPausedRef = useRef(false)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [locationLabel, setLocationLabel] = useState(DEFAULT_LOCATION_LABEL)
  const [isLocating, setIsLocating] = useState(false)

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const label = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
        setLocationLabel(label)
        setIsLocating(false)
      },
      () => setIsLocating(false),
      { timeout: 8000 }
    )
  }, [])

  // 이미 허용된 경우 마운트 시 자동 감지
  useEffect(() => {
    if (!navigator.permissions) return
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') detectLocation()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 자동 슬라이드 (4.5초 간격) — 일시정지 중이면 skip
  useEffect(() => {
    if (banners.length <= 1) return
    const timer = window.setInterval(() => {
      if (isPausedRef.current) return
      setHeroIndex((i) => (i + 1) % banners.length)
    }, HERO_AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [banners.length])

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [])

  // 드래그 시작 → 자동재생 일시정지
  const onHeroDragStart = useCallback(() => {
    isPausedRef.current = true
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
  }, [])

  // 드래그 종료 → 3초 후 자동재생 재개 (index 결정은 컴포넌트에서)
  const onHeroDragEnd = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => {
      isPausedRef.current = false
    }, HERO_RESUME_DELAY_MS)
  }, [])

  const onHeroIndexChange = useCallback((next: number) => {
    setHeroIndex(next)
  }, [])

  const goToRegion = useCallback(
    (region: RecommendedRegion) => {
      router.push(`/map?lat=${region.lat}&lng=${region.lng}`)
    },
    [router]
  )

  const goToParking = useCallback(
    (parking: PopularParking) => {
      router.push(`/search/${encodeURIComponent(parking.keyword)}`)
    },
    [router]
  )

  const goToTopParking = useCallback(
    (parking: TopParking) => {
      router.push(`/p/${parking.seq}`)
    },
    [router]
  )

  const goToKeyword = useCallback(
    (keyword: PopularKeyword) => {
      router.push(`/search/${encodeURIComponent(keyword.keyword)}`)
    },
    [router]
  )

  const goNearby = useCallback(() => {
    router.push('/map')
  }, [router])

  return {
    banners,
    heroIndex,
    onHeroDragStart,
    onHeroDragEnd,
    onHeroIndexChange,
    quickMenu,
    regions,
    parkings,
    topParkings,
    popularKeywords,
    isRegionsLoading,
    isParkingsLoading,
    isTopParkingsLoading,
    isPopularKeywordsLoading,
    locationLabel,
    isLocating,
    detectLocation,
    goToRegion,
    goToParking,
    goToTopParking,
    goToKeyword,
    goNearby
  }
}
