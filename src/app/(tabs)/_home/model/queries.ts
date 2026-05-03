import { useQuery } from '@tanstack/react-query'

import type { HeroBanner, PopularParking, QuickMenuItem, RecommendedRegion, TopParking } from './types'

import {
  fetchHeroBanners,
  fetchPopularParkings,
  fetchQuickMenu,
  fetchRecommendedRegions,
  fetchTopParkings
} from './api'

export const homeQueryKeys = {
  all: ['home'] as const,
  heroBanners: () => [...homeQueryKeys.all, 'heroBanners'] as const,
  quickMenu: () => [...homeQueryKeys.all, 'quickMenu'] as const,
  recommendedRegions: () => [...homeQueryKeys.all, 'recommendedRegions'] as const,
  popularParkings: () => [...homeQueryKeys.all, 'popularParkings'] as const,
  topParkings: () => [...homeQueryKeys.all, 'topParkings'] as const
}

export function useHeroBanners() {
  return useQuery<HeroBanner[]>({
    queryKey: homeQueryKeys.heroBanners(),
    queryFn: fetchHeroBanners,
    staleTime: 5 * 60_000
  })
}

export function useQuickMenu() {
  return useQuery<QuickMenuItem[]>({
    queryKey: homeQueryKeys.quickMenu(),
    queryFn: fetchQuickMenu,
    staleTime: Infinity
  })
}

export function useRecommendedRegions() {
  return useQuery<RecommendedRegion[]>({
    queryKey: homeQueryKeys.recommendedRegions(),
    queryFn: fetchRecommendedRegions,
    staleTime: 5 * 60_000
  })
}

export function usePopularParkings() {
  return useQuery<PopularParking[]>({
    queryKey: homeQueryKeys.popularParkings(),
    queryFn: fetchPopularParkings,
    staleTime: 60_000
  })
}

export function useTopParkings() {
  return useQuery<TopParking[]>({
    queryKey: homeQueryKeys.topParkings(),
    queryFn: fetchTopParkings,
    staleTime: Infinity
  })
}
