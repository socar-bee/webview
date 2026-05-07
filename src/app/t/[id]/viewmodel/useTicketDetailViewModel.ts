'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

import { useTicketDetail } from '../model'
import {
  CouponTypeGroup,
  PurchaseAvailabilityStatus,
  type ParkingLotDetail,
  type TicketDetail,
  type TicketListItem
} from '@/shared/types/parking'

/** 구매 버튼 노출 props — purchaseAvailability.status + couponTypeGroup 분기. */
export interface PurchaseButtonProps {
  text: string
  /** 매진 / 판매시간 외 / 종료 시 disabled */
  disabled: boolean
  /** 작은 텍스트 슬롯이 필요한 케이스(NOT_YET_OPEN 등) */
  fontSize: 'body' | 'caption'
  /** true: "앱에서 구매" 외부 이동, false: 내부 결제 플로우 */
  isAbleApp: boolean
}

interface UseTicketDetailViewModelParams {
  couponSeq: number | null
  /** SSR에서 받은 초기 데이터 */
  initialTicket?: TicketDetail
  /** 동일 주차장의 다른 티켓 목록 (탭 표시용) */
  parkingTickets?: TicketListItem[]
  /** 주차장 상세 (헤더/위치 표시용) */
  pin?: ParkingLotDetail
}

export function useTicketDetailViewModel({
  couponSeq,
  initialTicket,
  parkingTickets = [],
  pin
}: UseTicketDetailViewModelParams) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ── time filter carry (parkingDate / durationId) ──
  const parkingDate = searchParams?.get('parkingDate') ?? todayKST()
  const durationId = searchParams?.get('durationId') ?? ''

  const carryQuery = useMemo(() => {
    const p = new URLSearchParams()
    if (searchParams?.get('parkingDate')) p.set('parkingDate', searchParams.get('parkingDate')!)
    if (durationId) p.set('durationId', durationId)
    const s = p.toString()
    return s ? `?${s}` : ''
  }, [searchParams, durationId])

  // ── ticket detail (TanStack Query, SSR initialData 가능) ──
  const { data: ticket, isLoading } = useTicketDetail(couponSeq, parkingDate, initialTicket)

  // ── 결제 시트 노출 토글 (외부 결제 플로우에서 사용) ──
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false)

  // ── 구매 버튼 상태 도출 ──
  const purchaseButton = useMemo<PurchaseButtonProps>(() => {
    if (!ticket) return { text: '', disabled: true, fontSize: 'body', isAbleApp: false }

    const { couponTypeGroup, purchaseAvailability, usagePeriodLabel } = ticket
    const isMonthly = couponTypeGroup === CouponTypeGroup.MONTHLY
    const status = purchaseAvailability?.status

    if (status === PurchaseAvailabilityStatus.AVAILABLE && !isMonthly) {
      return { text: '구매하기', disabled: false, fontSize: 'body', isAbleApp: false }
    }
    if (status === PurchaseAvailabilityStatus.AVAILABLE && isMonthly) {
      return { text: '모두의주차장 앱에서 구매하기', disabled: false, fontSize: 'body', isAbleApp: true }
    }
    if (status === PurchaseAvailabilityStatus.SOLD_OUT) {
      return { text: '현재 매진', disabled: true, fontSize: 'body', isAbleApp: false }
    }
    if (status === PurchaseAvailabilityStatus.NOT_YET_OPEN) {
      return {
        text: usagePeriodLabel ? `판매시간 아님\n${usagePeriodLabel}` : '판매시간 아님',
        disabled: true,
        fontSize: 'caption',
        isAbleApp: false
      }
    }
    if (status === PurchaseAvailabilityStatus.CLOSED) {
      return { text: '판매기간 종료', disabled: true, fontSize: 'body', isAbleApp: false }
    }
    return { text: '', disabled: true, fontSize: 'body', isAbleApp: false }
  }, [ticket])

  // ── 탭(같은 주차장 티켓 목록) — 선택된 주차권이 항상 맨 앞 ──
  const tabs = useMemo(() => {
    const all = parkingTickets.map((t) => ({
      couponSeq: t.couponSeq,
      couponName: t.couponName,
      isActive: t.couponSeq === ticket?.couponSeq
    }))
    const active = all.filter((t) => t.isActive)
    const others = all.filter((t) => !t.isActive)
    return [...active, ...others]
  }, [parkingTickets, ticket?.couponSeq])

  // ── 핸들러 ──
  const goToTicketDetail = useCallback(
    (nextCouponSeq: number) => {
      router.push(`/t/${nextCouponSeq}${carryQuery}`)
    },
    [router, carryQuery]
  )

  const goToParkinglotDetail = useCallback(
    (parkinglotSeq: number) => {
      router.push(`/p/${parkinglotSeq}${carryQuery}`)
    },
    [router, carryQuery]
  )

  /** 뒤로가기 — 주차장 풀페이지(/p/[seq])로 이동. pin 없으면 브라우저 history back. */
  const goBack = useCallback(() => {
    if (!pin) {
      router.back()
      return
    }
    router.push(`/p/${pin.seq}${carryQuery}`)
  }, [pin, router, carryQuery])

  /** 구매 버튼 클릭 — isAbleApp이면 앱 딥링크 / 외부 이동, 아니면 결제 시트 오픈 */
  const handleClickPurchase = useCallback(() => {
    if (!ticket || purchaseButton.disabled) return
    if (purchaseButton.isAbleApp) {
      // 월정기는 외부 앱으로 유도 (실제 딥링크/스토어 이동 로직은 추후 연결)
      window.open(`https://app.modu.kr/t/${ticket.couponSeq}`, '_blank')
      return
    }
    setIsPurchaseOpen(true)
  }, [ticket, purchaseButton])

  return {
    ticket,
    isLoading,
    pin,
    tabs,
    purchaseButton,
    isPurchaseOpen,
    setIsPurchaseOpen,
    goToTicketDetail,
    goToParkinglotDetail,
    goBack,
    handleClickPurchase,
    parkingDate
  }
}

/** Asia/Seoul 기준 오늘 (YYYY-MM-DD) */
function todayKST(): string {
  const d = new Date()
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60_000
  const kst = new Date(utcMs + 9 * 60 * 60_000)
  const y = kst.getFullYear()
  const m = String(kst.getMonth() + 1).padStart(2, '0')
  const day = String(kst.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
