'use client'

import ngeohash from 'ngeohash'
import { useEffect, useMemo, useState } from 'react'

import apiClient from '@/shared/lib/apiClient'

export interface RecommendParking {
  seq: number
  name: string
  lat: number
  lng: number
  distance: number
  qty: number | null
  photos: string[]
  tickets: { name: string; price: number }[]
}

interface AvailableTicket {
  seq: number
  name: string
  price: number
  usagePeriodLabel: string
}

interface AvailableTicketsParkingLot {
  seq: number
  name: string
  coordinate: { latitude: number; longitude: number }
  qty: number
  images: { url: string; width: number; height: number }[]
  tickets: AvailableTicket[]
}

interface AvailableTicketsGeohashGroup {
  geohash: string
  parkingLots: AvailableTicketsParkingLot[]
}

interface UseRecommendParkingViewModelParams {
  seq: number | null
  lat?: number
  lng?: number
}

export function useRecommendParkingViewModel({ seq, lat, lng }: UseRecommendParkingViewModelParams) {
  const [items, setItems] = useState<RecommendParking[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const geohashes = useMemo(() => {
    if (!lat || !lng) return null
    const center = ngeohash.encode(lat, lng, 6)
    return [...ngeohash.neighbors(center), center].join(',')
  }, [lat, lng])

  useEffect(() => {
    if (!geohashes || !seq || !lat || !lng) return

    let cancelled = false
    setIsLoaded(false)

    const load = async () => {
      try {
        const { data } = await apiClient.get<{ data: AvailableTicketsGeohashGroup[] }>('/poi/available-tickets', {
          params: { geohash: geohashes }
        })

        if (cancelled) return

        const groups: AvailableTicketsGeohashGroup[] = data.data ?? []

        // 현재 주차장 제외 — PARTNER/구매가능 필터는 BE에서 처리됨
        const candidates = groups.flatMap((g) => g.parkingLots ?? []).filter((pl) => pl.seq !== seq)

        // 거리 계산 → 오름차순 정렬 → 상위 3개
        const sorted = candidates
          .map((pl) => ({
            pl,
            distance: Math.round(calcDistance(lat, lng, pl.coordinate.latitude, pl.coordinate.longitude))
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 3)

        if (cancelled) return

        const result: RecommendParking[] = sorted.map(({ pl, distance }) => ({
          seq: pl.seq,
          name: pl.name,
          lat: pl.coordinate.latitude,
          lng: pl.coordinate.longitude,
          distance,
          qty: pl.qty ?? null,
          photos: (pl.images ?? []).map((img) => img.url),
          tickets: [...(pl.tickets ?? [])]
            .sort((a, b) => a.price - b.price)
            .map((t) => ({ name: t.name, price: t.price }))
        }))

        setItems(result)
      } catch {
        setItems([])
      } finally {
        if (!cancelled) setIsLoaded(true)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [seq, lat, lng, geohashes])

  return { items, isLoaded }
}

/** Haversine distance (meters) */
function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
