'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { PopularParking, RecommendedRegion } from '../model'

import { useHeroBanners, usePopularParkings, useQuickMenu, useRecommendedRegions } from '../model'

const HERO_AUTOPLAY_MS = 4500

export function useHomeViewModel() {
  const router = useRouter()
  const { data: banners = [] } = useHeroBanners()
  const { data: quickMenu = [] } = useQuickMenu()
  const { data: regions = [], isLoading: isRegionsLoading } = useRecommendedRegions()
  const { data: parkings = [], isLoading: isParkingsLoading } = usePopularParkings()

  // Hero 캐러셀 인덱스
  const [heroIndex, setHeroIndex] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  // 자동 슬라이드 (4.5초 간격)
  useEffect(() => {
    if (banners.length <= 1) return
    const timer = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % banners.length)
    }, HERO_AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [banners.length])

  // 인덱스 → 가로 스크롤 동기화 (각 슬라이드 = 컨테이너 폭)
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    el.scrollTo({ left: el.clientWidth * heroIndex, behavior: 'smooth' })
  }, [heroIndex])

  // 사용자 가로 스와이프 → 인덱스 동기화
  const onHeroScroll = useCallback(() => {
    const el = heroRef.current
    if (!el) return
    const w = el.clientWidth
    if (!w) return
    const i = Math.round(el.scrollLeft / w)
    setHeroIndex((prev) => (prev === i ? prev : i))
  }, [])

  const goToRegion = useCallback(
    (region: RecommendedRegion) => {
      router.push(`/map?lat=${region.lat}&lng=${region.lng}`)
    },
    [router]
  )

  const goToParking = useCallback(
    (parking: PopularParking) => {
      router.push(`/p/${parking.seq}`)
    },
    [router]
  )

  const goNearby = useCallback(() => {
    router.push('/map')
  }, [router])

  return {
    banners,
    heroIndex,
    heroRef,
    onHeroScroll,
    quickMenu,
    regions,
    parkings,
    isRegionsLoading,
    isParkingsLoading,
    goToRegion,
    goToParking,
    goNearby
  }
}
