'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { useParkingLotDetail, useTicketList } from '../model'
import type { ParkingLotDetail, ParkingLotType } from '@/shared/types/parking'

export type DetailTabKey = 'tickets' | 'info' | 'recommend' | 'nearby'

export const DETAIL_TABS: { key: DetailTabKey; label: string }[] = [
  { key: 'tickets', label: '주차권' },
  { key: 'info', label: '정보' },
  { key: 'recommend', label: '추천' },
  { key: 'nearby', label: '주변' }
]

export function useParkingDetailViewModel(seq: number | null, type?: ParkingLotType, initialDetail?: ParkingLotDetail) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<DetailTabKey>('tickets')

  const { data: detail, isLoading: isDetailLoading } = useParkingLotDetail(seq, type, initialDetail)
  const { data: tickets, isLoading: isTicketsLoading } = useTicketList(activeTab === 'tickets' ? seq : null)

  const isLoading = isDetailLoading || isTicketsLoading

  const copyAddress = useCallback(async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
    } catch {}
  }, [])

  const goToPayment = useCallback(
    (couponSeq: number) => {
      if (!seq) return
      router.push(`/parking/${seq}/payment?couponSeq=${couponSeq}`)
    },
    [seq, router]
  )

  /** 현장 요금 포맷: calcPrices에서 60분(1시간) 기준 찾거나 첫 항목 사용 */
  const formatCurrentFee = useCallback((calcPrices: Record<string, number>) => {
    const entries = Object.entries(calcPrices)
    if (!entries.length) return null
    const hourEntry = entries.find(([k]) => Number(k) === 60)
    if (hourEntry) return `1시간 기준 ${hourEntry[1].toLocaleString()}원`
    const [key, val] = entries[0]
    const mins = Number(key)
    return mins >= 60 ? `${mins / 60}시간 기준 ${val.toLocaleString()}원` : `${mins}분 기준 ${val.toLocaleString()}원`
  }, [])

  return {
    detail,
    tickets: tickets ?? [],
    isLoading,
    activeTab,
    setActiveTab,
    copyAddress,
    goToPayment,
    formatCurrentFee
  }
}
