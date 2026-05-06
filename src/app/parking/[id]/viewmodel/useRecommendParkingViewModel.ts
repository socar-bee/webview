'use client'

import ngeohash from 'ngeohash'
import { useEffect, useMemo, useState } from 'react'

import apiClient from '@/shared/lib/apiClient'

import type { PinV2Pin, PinV2PrimaryTicket, PinsGroupV2 } from '@/shared/types/map'
import { PinV2Type } from '@/shared/types/map'
import type { ParkingLotDetail } from '@/shared/types/parking'

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
        // 시간 필터 기본값 조회
        const { data: tfData } = await apiClient.get<{
          data: { defaults: { durationId: string; date: string } }
        }>('/ticket/time-filter-options')
        const defaults = tfData.data.defaults

        // 주변 핀 조회
        const { data: pinsData } = await apiClient.get<{ data: PinsGroupV2[] }>('/poi/pins', {
          params: { geohash: geohashes, durationId: defaults.durationId, parkingDate: defaults.date },
          headers: { 'modu-api-version': '2' }
        })

        if (cancelled) return

        const groups: PinsGroupV2[] = pinsData.data ?? []

        // PARTNER만, 현재 주차장 제외, 구매 가능 티켓 있는 것만
        const partners = groups.flatMap((g) =>
          g.pins.filter(
            (pin) => pin.type === PinV2Type.PARTNER && pin.parkingLot.seq !== seq && getBuyableTickets(pin).length > 0
          )
        )

        // 거리 계산 + 정렬 → 상위 3개
        const sorted = partners
          .map((pin) => ({
            pin,
            distance: Math.round(calcDistance(lat, lng, pin.parkingLot.latitude, pin.parkingLot.longitude))
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 3)

        if (cancelled) return

        // 상위 3개 주차장 상세 조회 (사진, 면수)
        const details = await Promise.all(
          sorted.map(({ pin }) =>
            apiClient
              .get<{ data: ParkingLotDetail }>(`/poi/pins/P/${pin.parkingLot.seq}`)
              .then((r) => r.data.data)
              .catch(() => null)
          )
        )

        if (cancelled) return

        const result: RecommendParking[] = sorted.map(({ pin, distance }, i) => {
          const detail = details[i]
          const tickets = getBuyableTickets(pin)
            .sort((a, b) => a.price - b.price)
            .map((t) => ({ name: t.name, price: t.price }))
          return {
            seq: pin.parkingLot.seq,
            name: pin.parkingLot.name,
            lat: pin.parkingLot.latitude,
            lng: pin.parkingLot.longitude,
            distance,
            qty: detail?.basic.qty ?? null,
            photos: detail?.basic.photos.map((p) => p.file_name) ?? [],
            tickets
          }
        })

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

function getBuyableTickets(pin: PinV2Pin): PinV2PrimaryTicket[] {
  const all = [...(pin.tickets ?? []), ...(pin.primaryTicket ? [pin.primaryTicket] : [])]
  const seen = new Set<string>()
  return all.filter((t) => {
    if (!t.canBuy) return false
    const key = `${t.name}|${t.price}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
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
