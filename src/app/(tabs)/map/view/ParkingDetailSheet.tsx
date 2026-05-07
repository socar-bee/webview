'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import AnimationSheet, { type SheetSnap } from '@/shared/components/ui/AnimationSheet'
import Toast from '@/shared/components/ui/Toast'
import { useFavorites } from '@/shared/hooks/useFavorites'

import { formatModifyDate } from '@/shared/lib/date'

import type { RecommendParking } from '@/app/p/[id]/viewmodel'

import type { ParkingLotType, TicketListItem } from '@/shared/types/parking'
import { CategorySeq, CouponTypeGroup } from '@/shared/types/parking'

import { useParkingDetailViewModel, useRecommendParkingViewModel } from '@/app/p/[id]/viewmodel'

export interface ParkingDetailData {
  seq: number
  name: string
  isPartner?: boolean
  parkingType?: ParkingLotType
}

interface ParkingDetailSheetProps {
  isOpen: boolean
  snap: SheetSnap
  onSnapChange: (s: SheetSnap) => void
  onClose: () => void
  data: ParkingDetailData | null
  onLocationKnown?: (lat: number, lng: number) => void
}

type SheetTab = 'info' | 'recommend' | 'nearby'
const SHEET_TABS: { key: SheetTab; label: string }[] = [
  { key: 'info', label: '정보' },
  { key: 'recommend', label: '추천' },
  { key: 'nearby', label: '주변' }
]

export default function ParkingDetailSheet({
  isOpen,
  snap,
  onSnapChange,
  onClose,
  data,
  onLocationKnown
}: ParkingDetailSheetProps) {
  const vm = useParkingDetailViewModel(data?.seq ?? null, data?.parkingType)
  const tabsRef = useRef<HTMLDivElement>(null)
  const infoSectionRef = useRef<HTMLDivElement>(null)
  const recommendSectionRef = useRef<HTMLDivElement>(null)
  const nearbySectionRef = useRef<HTMLDivElement>(null)
  const heroSliderRef = useRef<HTMLDivElement>(null)
  const isScrollingByClickRef = useRef(false)

  const [activeSection, setActiveSection] = useState<SheetTab>('info')
  const [showNavTitle, setShowNavTitle] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)
  const [toastMsg, setToastMsg] = useState<{ id: number; message: string } | null>(null)

  const showToast = useCallback((message: string) => {
    setToastMsg({ id: Date.now(), message })
  }, [])

  const handleCopyAddress = useCallback(
    async (address: string) => {
      try {
        await navigator.clipboard.writeText(address)
        showToast('주소가 복사되었어요')
      } catch {
        showToast('복사에 실패했어요')
      }
    },
    [showToast]
  )

  const sectionRefs = useMemo<Record<SheetTab, React.RefObject<HTMLDivElement | null>>>(
    () => ({
      info: infoSectionRef,
      recommend: recommendSectionRef,
      nearby: nearbySectionRef
    }),
    []
  )

  const getScrollContainer = useCallback((): HTMLElement | null => {
    const el = tabsRef.current
    if (!el) return null
    let container: HTMLElement | null = el.parentElement
    while (container) {
      if (container.hasAttribute('data-sheet-scroll-body')) return container
      container = container.parentElement
    }
    return null
  }, [])

  const scrollToSection = useCallback(
    (key: SheetTab) => {
      const container = getScrollContainer()
      const target = sectionRefs[key].current
      if (!container || !target) return
      const tabsHeight = tabsRef.current?.offsetHeight ?? 0

      isScrollingByClickRef.current = true
      setActiveSection(key)
      container.scrollTo({ top: target.offsetTop - tabsHeight, behavior: 'smooth' })

      let timer: ReturnType<typeof setTimeout>
      const onScroll = () => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          isScrollingByClickRef.current = false
          container.removeEventListener('scroll', onScroll)
        }, 100)
      }
      container.addEventListener('scroll', onScroll, { passive: true })
    },
    [getScrollContainer, sectionRefs]
  )

  // Scrollspy
  useEffect(() => {
    if (!isOpen) return
    const container = getScrollContainer()
    const tabsEl = tabsRef.current
    if (!container || !tabsEl) return

    const tabsHeight = tabsEl.offsetHeight
    const entries = (Object.keys(sectionRefs) as SheetTab[])
      .map((key) => ({ key, el: sectionRefs[key].current }))
      .filter((e): e is { key: SheetTab; el: HTMLDivElement } => e.el !== null)

    const observer = new IntersectionObserver(
      (obs) => {
        if (isScrollingByClickRef.current) return
        obs.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute('data-section') as SheetTab | null
            if (key) setActiveSection(key)
          }
        })
      },
      { root: container, rootMargin: `-${tabsHeight}px 0px -80% 0px`, threshold: 0 }
    )

    entries.forEach(({ key, el }) => {
      el.setAttribute('data-section', key)
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [isOpen, getScrollContainer, sectionRefs])

  // 새 주차장 → 초기화
  useEffect(() => {
    const container = getScrollContainer()
    if (container) container.scrollTop = 0
    setActiveSection('info')
    setSlideIndex(0)
  }, [data?.seq, getScrollContainer])

  // snap 변경 시 NavBar 타이틀 리셋 + 스크롤 위치 리셋
  useEffect(() => {
    if (!isOpen || snap !== 'full') {
      setShowNavTitle(false)
      const container = getScrollContainer()
      if (container) container.scrollTop = 0
    }
  }, [isOpen, snap, getScrollContainer])

  // Full 상태 스크롤 → NavBar 타이틀 토글 (히어로 높이 기준)
  useEffect(() => {
    if (!isOpen || snap !== 'full') return
    const container = getScrollContainer()
    if (!container) return
    const THRESHOLD = 220
    const update = () => setShowNavTitle(container.scrollTop > THRESHOLD)
    update()
    container.addEventListener('scroll', update, { passive: true })
    return () => container.removeEventListener('scroll', update)
  }, [isOpen, snap, getScrollContainer])

  // Hero slider counter — 슬라이더 DOM이 detail 로드 후 마운트되므로
  // photos 길이를 dep에 포함시켜 리스너가 실제 렌더 시점에 부착되도록 함
  const photosLen = vm.detail?.basic.photos?.length ?? 0
  useEffect(() => {
    const slider = heroSliderRef.current
    if (!slider) return
    const onScroll = () => {
      const w = slider.offsetWidth
      if (w > 0) setSlideIndex(Math.round(slider.scrollLeft / w))
    }
    slider.addEventListener('scroll', onScroll, { passive: true })
    return () => slider.removeEventListener('scroll', onScroll)
  }, [data?.seq, photosLen])

  // 좌표 전달
  const lat = vm.detail?.basic.latitude
  const lng = vm.detail?.basic.longitude
  useEffect(() => {
    if (lat != null && lng != null) onLocationKnown?.(lat, lng)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng])

  const { favorites, toggle: toggleFavorite } = useFavorites()

  const sortedTickets = useMemo(
    () =>
      [...vm.tickets].sort((a, b) => {
        const ad = a.isSoldOut || !a.isOpen
        const bd = b.isSoldOut || !b.isOpen
        if (ad !== bd) return ad ? 1 : -1
        return a.price - b.price
      }),
    [vm.tickets]
  )

  if (!data) return null

  const detail = vm.detail
  const displayName = detail?.basic.name ?? data.name
  const isPartner = detail?.basic.partnerStatus ?? data.isPartner ?? false
  const capacity = detail?.basic.qty ?? null
  const isFavorited = favorites.some((f) => f.seq === data.seq)

  const getCategoryLabel = () => {
    if (isPartner) return '제휴'
    if (detail?.basic.category === CategorySeq.PUBLIC) return '공영'
    return '민영'
  }

  const handleToggleFavorite = () => {
    toggleFavorite({
      seq: data.seq,
      name: displayName,
      areaLabel: detail?.basic.newAddress || detail?.basic.address,
      image: detail?.basic.photos?.[0]?.file_name,
      isPartner: data.isPartner ?? !!detail?.basic.partnerStatus
    })
  }

  const heroImages = detail?.basic.photos ?? []
  const moduComment = detail?.basic.moduComment

  const openNavigation = () => {
    if (!detail) return
    const { latitude: lt, longitude: ln, name } = detail.basic
    window.location.href = `nmap://route/car?dlat=${lt}&dlng=${ln}&dname=${encodeURIComponent(name)}&appname=kr.modu.app`
  }

  return (
    <AnimationSheet
      isOpen={isOpen}
      snap={snap}
      onSnapChange={onSnapChange}
      onClose={onClose}
      peekHeight={96}
      halfRatio={0.45}
      navigationBar={<NavigationBar title={displayName} showTitle={showNavTitle} onBack={onClose} />}
      peek={
        snap !== 'full' ? (
          <PeekBar
            name={displayName}
            typeLabel={detail ? getCategoryLabel() : data.isPartner ? '제휴' : null}
            capacity={capacity}
            isFavorited={isFavorited}
            onToggleFavorite={handleToggleFavorite}
            onNavigate={openNavigation}
          />
        ) : null
      }
      overlay={
        <button
          onClick={onClose}
          className="bg-primary text-static-white shadow-02 pointer-events-auto flex h-11 items-center gap-1.5 rounded-full px-5 text-[14px] font-semibold"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
          </svg>
          지도보기
        </button>
      }
    >
      <div className="flex min-h-full flex-col">
        {/* ── Hero Image Slider ── */}
        <div className="bg-bg-soft relative h-[260px] w-full overflow-hidden">
          {heroImages.length === 0 ? (
            <Image src="/images/img_skeleton.png" alt="" fill sizes="480px" className="object-cover" />
          ) : (
            <>
              <div
                ref={heroSliderRef}
                className="scrollbar-hide flex h-full w-full overflow-x-scroll"
                style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
              >
                {heroImages.map((photo, i) => (
                  <div
                    key={i}
                    className="relative h-full w-full shrink-0"
                    style={{ scrollSnapAlign: 'start' } as React.CSSProperties}
                  >
                    <Image
                      src={photo.file_name}
                      alt={`${displayName} 이미지 ${i + 1}`}
                      fill
                      sizes="480px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              {heroImages.length > 1 && (
                <div className="pointer-events-none absolute right-3 bottom-3 flex h-6 min-w-[43px] items-center justify-center rounded-full bg-black/50 px-2">
                  <span className="text-[11px] font-medium text-white">
                    {slideIndex + 1}/{heroImages.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Title + CommentSection (full 상태에서만) ── */}
        {snap === 'full' && (
          <div className={`bg-bg-white px-4 pt-5 pb-4`}>
            {/* 타이틀 */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-text-strong text-[18px] leading-snug font-bold">{displayName}</h2>
                <div className="text-text-sub mt-1 flex items-center gap-1.5 text-[13px]">
                  <span>{getCategoryLabel()}</span>
                  {capacity !== null && (
                    <>
                      <svg width="3" height="3" viewBox="0 0 3 3" fill="none">
                        <circle cx="1.5" cy="1.5" r="1.5" fill="#A3A3A3" />
                      </svg>
                      <span>{capacity.toLocaleString()}면</span>
                    </>
                  )}
                  {(getCategoryLabel() || capacity !== null) && <span className="text-stroke-sub mx-0.5">|</span>}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleFavorite()
                    }}
                    aria-label={isFavorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    className="flex shrink-0 cursor-pointer items-center transition-transform active:scale-90"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/icn_favorite.webp"
                      alt=""
                      width={20}
                      height={20}
                      draggable={false}
                      className={`size-5 object-contain transition-[filter,opacity] ${isFavorited ? '' : 'opacity-50 grayscale'}`}
                    />
                  </button>
                </div>
              </div>
              <button
                type="button"
                aria-label="길찾기"
                onClick={openNavigation}
                className="bg-primary text-static-white flex size-[53px] shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[8px]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11.8333 4.50079C11.8333 4.07135 12.339 3.84137 12.6624 4.12384L19.4036 10.0223C19.6311 10.2215 19.6311 10.576 19.4036 10.7752L12.6624 16.6727C12.3391 16.9555 11.8333 16.7263 11.8333 16.2967V12.3983H10.3333C8.95268 12.3983 7.83349 13.5177 7.83325 14.8983V19.3983H3.83325V14.3983C3.83349 11.0847 6.51969 8.39826 9.83325 8.39826H11.8333V4.50079Z"
                    fill="white"
                  />
                </svg>
                <span className="text-[10px] font-medium tracking-[0.3px]">길찾기</span>
              </button>
            </div>
            {/* CommentSection — 주차권 없는 경우만 */}
            {(!isPartner || sortedTickets.length === 0) && (
              <div className="bg-bg-soft mt-3.5 rounded-md px-5 py-2 text-center">
                <p className="text-text-sub text-[13px]">아직 주차권을 판매하지 않는 현장입니다.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Ticket stub cards ── */}
        {isPartner && sortedTickets.length > 0 && (
          <TicketList
            tickets={sortedTickets}
            onTicketClick={(seq) => vm.goToTicketDetail(seq)}
            moduComment={moduComment || undefined}
          />
        )}

        {/* ── Section divider ── */}
        <div className="bg-bg-weak h-2.5" />

        {/* ── Scrollspy tabs ── */}
        <div ref={tabsRef} className="border-stroke-soft bg-bg-white sticky top-0 z-10 border-b">
          <div className="flex">
            {SHEET_TABS.map((tab) => {
              const isActive = tab.key === activeSection
              return (
                <button
                  key={tab.key}
                  onClick={() => scrollToSection(tab.key)}
                  className={`flex flex-1 items-end justify-center pt-[14px] pb-0 transition-colors ${
                    isActive ? 'text-text-strong' : 'text-text-disabled'
                  }`}
                >
                  <span className="inline-flex flex-col items-stretch gap-[10px]">
                    <span className="text-[15px] leading-none font-semibold">{tab.label}</span>
                    <span className={`h-1 rounded-full ${isActive ? 'bg-primary' : 'invisible'}`} />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Info section ── */}
        <div ref={infoSectionRef} className="bg-bg-white">
          <InfoTab
            detail={detail}
            isLoading={vm.isLoading}
            onCopyAddress={handleCopyAddress}
            formatCurrentFee={vm.formatCurrentFee}
          />
        </div>
        <div className="bg-bg-weak h-2.5" />

        {/* ── Recommend section ── */}
        <div ref={recommendSectionRef} className="bg-bg-white">
          <RecommendTab seq={data.seq} lat={detail?.basic.latitude} lng={detail?.basic.longitude} />
        </div>
        <div className="bg-bg-weak h-2.5" />

        {/* ── Nearby section ── */}
        <div ref={nearbySectionRef} className="bg-bg-white">
          <NearbyTab detail={detail} />
        </div>

        <Footer />
      </div>
      <Toast id={toastMsg?.id} message={toastMsg?.message ?? null} onDismiss={() => setToastMsg(null)} />
    </AnimationSheet>
  )
}

/* ─── NavigationBar ─── */
function NavigationBar({ title, showTitle, onBack }: { title: string; showTitle: boolean; onBack: () => void }) {
  return (
    <div className="flex h-12 items-center justify-between px-2">
      <button onClick={onBack} className="flex size-10 cursor-pointer items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h2
        className={`text-text-strong truncate px-2 text-[16px] font-bold transition-opacity duration-200 ${
          showTitle ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden={!showTitle}
      >
        {title}
      </h2>
      <div className="size-10" />
    </div>
  )
}

/* ─── PeekBar (모든 snap 상태에서 고정 노출) ─── */
function PeekBar({
  name,
  typeLabel,
  capacity,
  isFavorited,
  onToggleFavorite,
  onNavigate
}: {
  name: string
  typeLabel: string | null
  capacity: number | null
  isFavorited: boolean
  onToggleFavorite: () => void
  onNavigate: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-1 pb-5">
      <div className="min-w-0 flex-1">
        <h3 className="text-text-strong truncate text-[18px] leading-[1.4] font-bold">{name}</h3>
        <div className="text-text-sub mt-0.5 flex items-center gap-1.5 text-[14px]">
          {typeLabel && <span>{typeLabel}</span>}
          {typeLabel && capacity !== null && (
            <svg width="4" height="4" viewBox="0 0 4 4" fill="none">
              <circle cx="2" cy="2" r="2" fill="#A3A3A3" />
            </svg>
          )}
          {capacity !== null && <span>{capacity.toLocaleString()}면</span>}
          {(typeLabel || capacity !== null) && <span className="text-stroke-sub">|</span>}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            aria-label={isFavorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            className="flex shrink-0 cursor-pointer items-center transition-transform active:scale-90"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/icn_favorite.webp"
              alt=""
              width={20}
              height={20}
              draggable={false}
              className={`size-5 object-contain transition-[filter,opacity] ${isFavorited ? '' : 'opacity-50 grayscale'}`}
            />
          </button>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onNavigate()
        }}
        className="bg-primary text-static-white flex size-[53px] shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[8px]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M11.8333 4.50079C11.8333 4.07135 12.339 3.84137 12.6624 4.12384L19.4036 10.0223C19.6311 10.2215 19.6311 10.576 19.4036 10.7752L12.6624 16.6727C12.3391 16.9555 11.8333 16.7263 11.8333 16.2967V12.3983H10.3333C8.95268 12.3983 7.83349 13.5177 7.83325 14.8983V19.3983H3.83325V14.3983C3.83349 11.0847 6.51969 8.39826 9.83325 8.39826H11.8333V4.50079Z"
            fill="white"
          />
        </svg>
        <span className="text-[10px] font-medium tracking-[0.3px]">길찾기</span>
      </button>
    </div>
  )
}

/* ─── TicketList ─── */
const TICKET_PREVIEW_COUNT = 3

function TicketList({
  tickets,
  onTicketClick,
  moduComment
}: {
  tickets: TicketListItem[]
  onTicketClick: (seq: number) => void
  moduComment?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = tickets.length > TICKET_PREVIEW_COUNT
  const visible = expanded ? tickets : tickets.slice(0, TICKET_PREVIEW_COUNT)

  return (
    <div className="bg-bg-white px-4 pt-4 pb-4">
      {moduComment && (
        <div className="mb-3 rounded-md bg-sky-50 px-5 py-2 text-center">
          <p className="text-text-strong text-[13px]">{moduComment}</p>
        </div>
      )}
      <div className="flex flex-col gap-2.5 pt-4">
        {visible.map((ticket) => (
          <TicketStubCard key={ticket.couponSeq} ticket={ticket} onClick={() => onTicketClick(ticket.couponSeq)} />
        ))}
      </div>
      {hasMore && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="border-primary/20 text-primary mt-2.5 flex h-[48px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border bg-white text-[14px] font-semibold shadow-[0_2px_10px_rgba(59,130,246,0.09)] transition-all hover:shadow-[0_2px_14px_rgba(59,130,246,0.14)] active:scale-[0.99]"
        >
          전체보기
          <span className="text-primary/60 text-[13px] font-medium">({tickets.length}개)</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="ml-0.5">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

/* ─── TicketStubCard ─── */
function TicketStubCard({ ticket, onClick }: { ticket: TicketListItem; onClick: () => void }) {
  const isDisabled = ticket.isSoldOut || !ticket.isOpen
  const isSoldOut = ticket.isSoldOut
  const isComingSoon = !ticket.isOpen && !ticket.isSoldOut
  // 100,000원 이상이면 폰트 다운그레이드 (1,000,000 같은 큰 숫자 안전)
  const isLarge = ticket.price >= 100000

  const statusLabel = isSoldOut ? '매진' : isComingSoon ? '판매예정' : '구매가능'
  const statusColor = isSoldOut ? 'bg-[#d1d5db]' : isComingSoon ? 'bg-amber-400' : 'bg-emerald-400'

  const descLine =
    ticket.isOpen || Number(ticket.couponTypeGroup) === CouponTypeGroup.MONTHLY
      ? `${ticket.usingDateLabel} ${ticket.usingTimeLabel}`
      : ticket.nextTimeLabel

  return (
    <div
      className={`relative w-full ${isDisabled ? 'cursor-default' : 'cursor-pointer'}`}
      onClick={() => !isDisabled && onClick()}
    >
      <div
        className={`flex h-[86px] w-full overflow-visible rounded-2xl border ${
          isDisabled
            ? 'border-[#e9ebef] bg-[#f7f8fa]'
            : 'border-primary/20 bg-white shadow-[0_2px_10px_rgba(59,130,246,0.09)]'
        }`}
      >
        {/* 왼쪽: 정보 영역 */}
        <div className="flex flex-1 flex-col justify-center gap-1 px-4">
          {/* 상태 */}
          <div className="flex items-center gap-1.5">
            <span className={`h-[6px] w-[6px] shrink-0 rounded-full ${statusColor}`} />
            <span className={`text-[11px] font-medium ${isDisabled ? 'text-[#b0b8c1]' : 'text-[#64748b]'}`}>
              {statusLabel}
            </span>
          </div>
          {/* 이름 */}
          <p
            className={`truncate text-[15px] leading-tight font-bold ${isDisabled ? 'text-[#b0b8c1]' : 'text-[#1e293b]'}`}
          >
            {ticket.couponName}
          </p>
          {/* 날짜/시간 */}
          {descLine && (
            <p className={`truncate text-[11px] ${isDisabled ? 'text-[#c8d0da]' : 'text-[#94a3b8]'}`}>{descLine}</p>
          )}
        </div>

        {/* 세로 뜯는 선 — 상/하단 반원 노치 + 점선 */}
        <div className="relative flex flex-col items-center py-3">
          {/* 상단 노치 */}
          <div
            className={`absolute -top-[1px] h-[10px] w-[20px] rounded-b-full border-x border-b ${
              isDisabled ? 'bg-bg-weak border-[#e9ebef]' : 'border-primary/20 bg-bg-white'
            }`}
          />
          {/* 점선 */}
          <div
            className={`h-full w-px border-l border-dashed ${isDisabled ? 'border-[#e9ebef]' : 'border-primary/20'}`}
          />
          {/* 하단 노치 */}
          <div
            className={`absolute -bottom-[1px] h-[10px] w-[20px] rounded-t-full border-x border-t ${
              isDisabled ? 'bg-bg-weak border-[#e9ebef]' : 'border-primary/20 bg-bg-white'
            }`}
          />
        </div>

        {/* 오른쪽: 가격 영역 — 큰 금액(1M+) 안전하게 들어가도록 동적 사이징 */}
        <div className="flex shrink-0 flex-col items-center justify-center gap-1.5 px-3">
          <p
            className={`leading-none font-bold tracking-tight whitespace-nowrap ${
              isLarge ? 'text-[15px]' : 'text-[18px]'
            } ${isDisabled ? 'text-[#c8d0da]' : 'text-primary'}`}
          >
            {ticket.price.toLocaleString()}
            <span className={`ml-0.5 text-[11px] font-medium ${isDisabled ? 'text-[#c8d0da]' : 'text-primary/80'}`}>
              원
            </span>
          </p>
          {!isDisabled && <span className="text-primary/60 text-[11px] font-medium">구매하기 ›</span>}
        </div>
      </div>
    </div>
  )
}

/* ─── InfoTab ─── */
function InfoTab({
  detail,
  isLoading,
  onCopyAddress,
  formatCurrentFee
}: {
  detail: ReturnType<typeof useParkingDetailViewModel>['detail']
  isLoading: boolean
  onCopyAddress: (addr: string) => void
  formatCurrentFee: (prices: Record<string, number>) => string | null
}) {
  if (isLoading && !detail) {
    return (
      <div className="flex flex-col gap-4 p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-soft h-20 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }
  if (!detail) return null

  const { basic, times, prices, modifyDate, openFree } = detail
  const currentFee = formatCurrentFee(basic.calcPrices)
  const address = basic.newAddress || basic.address
  const operationTime = openFree.operationTime?.replace(/익일\s*/g, '') ?? null

  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      {modifyDate && (
        <div className="flex items-center justify-end gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#A3A3A3" strokeWidth="1.5" />
            <path d="M12 7v5l3 3" stroke="#A3A3A3" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-text-disabled text-[12px]">정보 업데이트: {formatModifyDate(modifyDate)}</span>
        </div>
      )}

      {/* 요금 안내 */}
      {prices.length > 0 && prices[0].contents.length > 0 && (
        <InfoCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          }
          title="요금 안내"
        >
          <div className="flex flex-col gap-2">
            {prices[0].contents.slice(0, 4).map((item, idx) => (
              <div key={`price-${idx}`} className="flex items-center justify-between gap-3">
                <span className="text-text-sub text-[13px]">{item.key}</span>
                <span className="text-text-strong text-right text-[13px]">{item.value}</span>
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {/* 운영 시간 */}
      {times.length > 0 && times[0].contents.length > 0 && (
        <InfoCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          title="운영 시간"
        >
          <div className="flex flex-col gap-2">
            {times[0].contents.map((item, idx) => (
              <div key={`time-${idx}`} className="flex items-center justify-between gap-3">
                <span className="text-text-sub text-[13px]">{item.key}</span>
                <span className="text-text-strong text-right text-[13px]">{item.value}</span>
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {/* 요약 요금/시간 — 상세 데이터 없을 때 fallback */}
      {(prices.length === 0 || prices[0].contents.length === 0) && currentFee && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-sub shrink-0 text-[14px]">현장 요금</span>
          <span className="text-text-strong text-right text-[14px]">{currentFee}</span>
        </div>
      )}
      {(times.length === 0 || times[0].contents.length === 0) && operationTime && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-sub shrink-0 text-[14px]">운영 시간</span>
          <span className="text-text-strong text-right text-[14px]">{operationTime}</span>
        </div>
      )}

      {/* 주소 */}
      {address && (
        <InfoCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          }
          title="주소"
        >
          <button
            className="flex w-full min-w-0 cursor-pointer items-center gap-1 text-left"
            onClick={() => onCopyAddress(address)}
          >
            <span className="text-text-strong flex-1 text-[13px]">{address}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect x="9" y="9" width="11" height="11" rx="1.5" stroke="#A3A3A3" strokeWidth="1.5" />
              <path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" stroke="#A3A3A3" strokeWidth="1.5" />
            </svg>
          </button>
        </InfoCard>
      )}

      {/* 추가 정보 (options) */}
      {basic.options.length > 0 && (
        <InfoCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"
                fill="currentColor"
              />
            </svg>
          }
          title="추가 정보"
        >
          <div className="flex flex-wrap gap-2">
            {basic.options.map((opt) => (
              <span key={opt} className="bg-primary/10 text-primary rounded-full px-3 py-1.5 text-[12px] font-medium">
                {opt}
              </span>
            ))}
          </div>
        </InfoCard>
      )}

      {/* 주차장 번호 */}
      {basic.phone && (
        <InfoCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          }
          title="주차장번호"
        >
          <a href={`tel:${basic.phone}`} className="text-primary text-[14px] font-medium">
            {basic.phone}
          </a>
        </InfoCard>
      )}

      {/* 주의사항 */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
          <path d="M12 2L2 20h20L12 2z" stroke="#F59E0B" strokeWidth="1.5" />
          <path d="M12 9v5M12 16.5v.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="text-[12px] leading-relaxed text-amber-700">
          현장 정보와 일치하지 않아 발생한 피해는 모두의주차장이 책임을 지거나 보상하지 않습니다.
        </p>
      </div>
    </div>
  )
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="border-stroke-soft flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <span className="text-text-strong text-[14px] font-bold">{title}</span>
      </div>
      {children}
    </div>
  )
}

/* ─── RecommendTab ─── */
function RecommendTab({ seq, lat, lng }: { seq: number; lat?: number; lng?: number }) {
  const { items, isLoaded } = useRecommendParkingViewModel({ seq, lat, lng })

  return (
    <div className="flex flex-col gap-3 px-4 py-6">
      <h2 className="text-text-strong text-[18px] font-bold">추천 주차장</h2>

      {!isLoaded ? (
        <div className="scrollbar-hide flex gap-3 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[290px] shrink-0">
              <div className="bg-bg-soft h-[180px] animate-pulse rounded-xl" />
              <div className="bg-bg-soft mt-3 h-5 w-3/4 animate-pulse rounded" />
              <div className="bg-bg-soft mt-2 h-4 w-1/2 animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-text-soft py-6 text-center text-[14px]">주변에 추천할 주차장이 없습니다.</p>
      ) : (
        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4">
          {items.map((item, i) => (
            <RecommendCard key={item.seq} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function RecommendCard({ item, index }: { item: RecommendParking; index: number }) {
  const firstTicket = item.tickets[0]
  const extraCount = item.tickets.length - 1

  return (
    <motion.div
      className="w-[290px] shrink-0"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.35, ease: 'easeOut' }}
    >
      <Link href={`/p/${item.seq}`} className="flex flex-col gap-3">
        <div className="h-[180px] w-full overflow-hidden rounded-xl">
          {item.photos.length > 0 ? (
            <div className="scrollbar-hide flex h-full snap-x snap-mandatory overflow-x-auto">
              {item.photos.map((src, i) => (
                <div key={i} className="relative h-full w-full shrink-0 snap-center">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="290px"
                    className="object-cover"
                    onError={(e) => {
                      const el = (e.target as HTMLElement).closest('.relative') as HTMLElement | null
                      if (el) el.style.display = 'none'
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex size-full items-center justify-center bg-[#dee4e9]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="#b8c3d0" strokeWidth="1.5" />
                <circle cx="8.5" cy="10.5" r="2" stroke="#b8c3d0" strokeWidth="1.5" />
                <path
                  d="M2 17l5-4 3 2 5-5 7 7"
                  stroke="#b8c3d0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex max-w-[180px] min-w-0 items-center gap-1">
            <span className="truncate text-[15px] font-bold text-[#263238]">{item.name}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M9 6l6 6-6 6" stroke="#6D7D90" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-[13px] text-[#b8c3d0]">
            <span>{item.qty ? `${item.qty.toLocaleString()}면` : '정보없음'}</span>
            <span>·</span>
            <span>{item.distance >= 1000 ? `${(item.distance / 1000).toFixed(1)}km` : `${item.distance}m`}</span>
          </div>
        </div>

        {firstTicket && (
          <p className="text-primary truncate text-[13px] font-medium">
            {firstTicket.name} {firstTicket.price.toLocaleString()}원{extraCount > 0 && ` 외 ${extraCount}개`}
          </p>
        )}
      </Link>
    </motion.div>
  )
}

/* ─── NearbyTab ─── */
function NearbyTab({ detail }: { detail: ReturnType<typeof useParkingDetailViewModel>['detail'] }) {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null)

  if (!detail?.aiDescription) {
    return (
      <div className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="bg-primary/10 flex items-center rounded-full px-2 py-0.5">
            <span className="text-primary text-[10px] font-bold">AI</span>
          </div>
          <span className="text-text-strong text-[15px] font-bold">주변 정보</span>
        </div>
        <p className="text-text-disabled text-[14px]">주변 정보가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="bg-primary/10 flex items-center rounded-full px-2 py-0.5">
          <span className="text-primary text-[10px] font-bold">AI</span>
        </div>
        <span className="text-text-strong text-[15px] font-bold">주변 정보</span>
      </div>

      <div className="flex items-start gap-2.5">
        {/* AI 아바타 */}
        <div className="bg-primary/10 flex shrink-0 items-center justify-center overflow-hidden rounded-full p-1.5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2a2 2 0 0 1 2 2v1h3a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h3V4a2 2 0 0 1 2-2zm-3 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"
              fill="currentColor"
              className="text-primary"
            />
          </svg>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {/* 말풍선 */}
          <div className="border-stroke-soft rounded-2xl rounded-tl-sm border bg-gradient-to-br from-[#fafafa] to-[#f0f4f8] px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <p className="text-text-strong text-[13px] leading-relaxed">{detail.aiDescription.response}</p>
            <div className="border-stroke-soft mt-2 border-t pt-2">
              <span className="text-text-disabled text-[11px]">AI가 작성한 정보로 실제와 다를 수 있어요</span>
            </div>
          </div>

          {/* 피드백 버튼 */}
          <div className="flex items-center gap-3">
            <span className="text-text-disabled text-[12px]">도움이 됐나요?</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={feedback === 'dislike'}
                onClick={() => setFeedback((prev) => (prev === 'like' ? null : 'like'))}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] leading-none font-medium transition-all ${
                  feedback === 'like'
                    ? 'bg-primary pointer-events-none text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)]'
                    : feedback !== null
                      ? 'bg-bg-soft text-text-disabled pointer-events-none'
                      : 'bg-primary/10 text-primary active:bg-primary/20'
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                </svg>
                추천
              </button>
              <button
                type="button"
                disabled={feedback === 'like'}
                onClick={() => setFeedback((prev) => (prev === 'dislike' ? null : 'dislike'))}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] leading-none font-medium transition-all ${
                  feedback === 'dislike'
                    ? 'bg-primary pointer-events-none text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)]'
                    : feedback !== null
                      ? 'bg-bg-soft text-text-disabled pointer-events-none'
                      : 'bg-bg-soft text-text-sub active:bg-bg-weak'
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="rotate-180">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                </svg>
                비추천
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Footer ─── */
function Footer() {
  return (
    <div className="bg-bg-soft px-4 py-6 pb-24">
      <button
        className="border-stroke-soft text-text-strong h-[38px] w-full rounded-lg border bg-white text-[13px] font-medium"
        onClick={() => window.open('https://l.modu.kr/main', '_blank')}
      >
        앱 다운로드하기
      </button>
      <div className="mt-6 flex flex-col gap-2">
        {[
          '(주) 쏘카',
          '통신판매업 신고: 제 2019-제주오라-3호',
          '사업자등록번호: 616-81-90529, 대표자: 박재욱',
          '서비스 문의 번호: 1899-8242, Fax: 02-6969-9333',
          '주소: 제주특별자치도 제주시 공항서로 141 (도두이동)'
        ].map((text) => (
          <p key={text} className="text-text-sub text-[11px] leading-[1.5]">
            {text}
          </p>
        ))}
        <div className="mt-1 flex items-center">
          {[
            { label: '이용약관', href: 'https://app.modu.kr/terms' },
            { label: '개인정보처리방침', href: 'https://app.modu.kr/privacy' },
            { label: '위치정보 이용약관', href: 'https://app.modu.kr/location' },
            { label: '고객센터', href: 'https://help.modu.kr' }
          ].map((item, i, arr) => (
            <span key={item.href} className="flex items-center">
              <Link
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-sub text-[11px] underline underline-offset-2"
              >
                {item.label}
              </Link>
              {i < arr.length - 1 && <span className="border-stroke-sub mx-2 inline-block h-[8px] w-px border-l" />}
            </span>
          ))}
        </div>
        <hr className="border-stroke-soft mt-1" />
      </div>
    </div>
  )
}
