'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { formatModifyDate } from '@/shared/lib/date'

import { useParkingDetailViewModel, useRecommendParkingViewModel } from '../viewmodel'
import type { ParkingLotTimeContent, TicketListItem } from '@/shared/types/parking'
import { CategorySeq, CouponTypeGroup } from '@/shared/types/parking'

type SectionKey = 'info' | 'recommend' | 'nearby'

interface ParkingDetailViewProps {
  seq: number
  initialDetail?: Parameters<typeof useParkingDetailViewModel>[2]
}

export default function ParkingDetailView({ seq, initialDetail }: ParkingDetailViewProps) {
  const router = useRouter()
  const vm = useParkingDetailViewModel(seq, undefined, initialDetail)
  const detail = vm.detail

  const { items: recommendItems, isLoaded: isRecommendLoaded } = useRecommendParkingViewModel({
    seq: detail?.seq ?? null,
    lat: detail?.basic.latitude,
    lng: detail?.basic.longitude
  })

  const scrollRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const heroSliderRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const recommendRef = useRef<HTMLDivElement>(null)
  const nearbyRef = useRef<HTMLDivElement>(null)
  const isScrollingByClick = useRef(false)

  const [showName, setShowName] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)
  const [activeSection, setActiveSection] = useState<SectionKey>('info')

  const tabs = useMemo(
    () => [
      { key: 'info' as const, label: '정보' },
      ...(isRecommendLoaded && recommendItems.length > 0 ? [{ key: 'recommend' as const, label: '추천' }] : []),
      ...(detail?.aiDescription ? [{ key: 'nearby' as const, label: '주변' }] : [])
    ],
    [isRecommendLoaded, recommendItems.length, detail?.aiDescription]
  )

  // Header visibility
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const heroHeight = heroRef.current?.offsetHeight ?? 280
      setShowName(el.scrollTop >= heroHeight)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Hero slider counter
  useEffect(() => {
    const slider = heroSliderRef.current
    if (!slider) return
    const onScroll = () => setSlideIndex(Math.round(slider.scrollLeft / slider.offsetWidth))
    slider.addEventListener('scroll', onScroll, { passive: true })
    return () => slider.removeEventListener('scroll', onScroll)
  }, [detail?.basic.photos])

  // Scrollspy
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const tabsHeight = tabsRef.current?.offsetHeight ?? 44

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingByClick.current) return
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute('data-section') as SectionKey)
          }
        })
      },
      { root: container, rootMargin: `-${tabsHeight}px 0px -60% 0px`, threshold: 0 }
    )

    ;[
      [infoRef, 'info'],
      [recommendRef, 'recommend'],
      [nearbyRef, 'nearby']
    ].forEach(([ref, key]) => {
      const el = (ref as React.RefObject<HTMLDivElement | null>).current
      if (el) {
        el.setAttribute('data-section', key as string)
        observer.observe(el)
      }
    })

    return () => observer.disconnect()
  }, [detail, isRecommendLoaded, recommendItems.length])

  const getSectionRef = (key: SectionKey) => {
    if (key === 'recommend') return recommendRef
    if (key === 'nearby') return nearbyRef
    return infoRef
  }

  const scrollToSection = useCallback((key: SectionKey) => {
    const container = scrollRef.current
    const ref = getSectionRef(key)
    if (!container || !ref.current) return
    const tabsHeight = tabsRef.current?.offsetHeight ?? 44
    const containerTop = container.getBoundingClientRect().top
    const sectionTop = ref.current.getBoundingClientRect().top
    isScrollingByClick.current = true
    setActiveSection(key)
    container.scrollTo({ top: container.scrollTop + (sectionTop - containerTop) - tabsHeight, behavior: 'smooth' })
    setTimeout(() => {
      isScrollingByClick.current = false
    }, 600)
  }, [])

  const openNavigation = () => {
    if (!detail) return
    const { latitude: lat, longitude: lng, name } = detail.basic
    window.location.href = `nmap://route/car?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(name)}&appname=kr.modu.app`
  }

  const heroImages = detail?.basic.photos ?? []
  const isPartner = detail?.basic.partnerStatus ?? false
  const moduComment = detail?.basic.moduComment
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

  const getCategoryLabel = () => {
    if (isPartner) return '제휴'
    if (detail?.basic.category === CategorySeq.PUBLIC) return '공영'
    return '민영'
  }

  return (
    <div ref={scrollRef} className="scrollbar-hide bg-bg-weak relative h-full overflow-y-auto">
      {/* ── Floating overlay header ── */}
      <div className="sticky top-0 z-30 h-0 w-full">
        <div
          className={`absolute inset-x-0 top-0 px-4 py-3 transition-[backdrop-filter] ${showName ? 'backdrop-blur-sm' : ''}`}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex size-[35px] cursor-pointer items-center justify-center rounded-full bg-white/80 shadow"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#171717"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {showName && detail && (
              <span className="text-text-strong max-w-[50vw] truncate text-sm font-semibold">{detail.basic.name}</span>
            )}
            <button
              type="button"
              className="flex size-[35px] cursor-pointer items-center justify-center rounded-full bg-white/80 shadow"
              onClick={() => {
                if (navigator.share && detail)
                  navigator.share({ title: detail.basic.name, url: window.location.href }).catch(() => {})
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="18" cy="5" r="3" stroke="#171717" strokeWidth="1.8" />
                <circle cx="6" cy="12" r="3" stroke="#171717" strokeWidth="1.8" />
                <circle cx="18" cy="19" r="3" stroke="#171717" strokeWidth="1.8" />
                <path
                  d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49"
                  stroke="#171717"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero Image Slider ── */}
      <div ref={heroRef} className="bg-bg-soft relative h-[280px] w-full overflow-hidden">
        {heroImages.length === 0 ? (
          <Image src="/images/img_skeleton.png" alt="" fill sizes="100vw" className="object-cover" />
        ) : (
          <>
            <div
              ref={heroSliderRef}
              className="scrollbar-hide flex h-[280px] w-full overflow-x-scroll"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            >
              {heroImages.map((photo, i) => (
                <div
                  key={i}
                  className="relative h-[280px] w-full shrink-0"
                  style={{ scrollSnapAlign: 'start' } as React.CSSProperties}
                >
                  <Image
                    src={photo.file_name}
                    alt={`${detail?.basic.name ?? ''} 이미지 ${i + 1}`}
                    fill
                    sizes="(max-width: 480px) 100vw, 480px"
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

      {/* ── Title section ── */}
      <div className="bg-bg-white px-4 pt-6 pb-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 pr-3">
            {vm.isLoading && !detail ? (
              <div className="bg-bg-soft h-6 w-40 animate-pulse rounded-md" />
            ) : (
              <h1 className="text-text-strong text-xl leading-snug font-bold">{detail?.basic.name ?? '주차장 상세'}</h1>
            )}
            <div className="text-text-sub mt-1 flex items-center gap-1 text-sm">
              <span>{getCategoryLabel()}</span>
              {detail?.basic.qty != null && (
                <>
                  <span className="text-text-disabled">·</span>
                  <span>{detail.basic.qty.toLocaleString()}면</span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label="길찾기"
            onClick={openNavigation}
            className="bg-primary/10 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 11l19-9-9 19-2-8-8-2z"
                stroke="#0099FF"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* CommentSection — 주차권 없는 경우만 */}
        {(!isPartner || sortedTickets.length === 0) && (
          <div className="bg-bg-soft mt-4 rounded-md px-6 py-2.5 text-center">
            <p className="text-text-sub text-sm">아직 주차권을 판매하지 않는 현장입니다.</p>
          </div>
        )}
      </div>

      {/* ── Ticket stub cards ── */}
      {isPartner && sortedTickets.length > 0 && (
        <div className="bg-bg-white pb-5 pl-4">
          {moduComment && (
            <div className="mb-3 rounded-md bg-sky-50 px-5 py-2 pt-4 text-center">
              <p className="text-text-strong text-[13px]">{moduComment}</p>
            </div>
          )}
          <div className={`scrollbar-hide flex gap-2 overflow-x-auto pr-4 ${moduComment ? '' : 'pt-4'}`}>
            {sortedTickets.map((ticket) => (
              <TicketStubCard key={ticket.couponSeq} ticket={ticket} onClick={() => vm.goToPayment(ticket.couponSeq)} />
            ))}
            <div className="w-2 shrink-0" />
          </div>
        </div>
      )}

      {/* ── Section divider ── */}
      <div className="bg-bg-weak h-2.5" />

      {/* ── Scrollspy tabs ── */}
      <div ref={tabsRef} className="border-stroke-soft bg-bg-white sticky top-0 z-20 border-b">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => scrollToSection(tab.key)}
              className="relative flex-1 cursor-pointer py-3 text-sm"
            >
              <span className={activeSection === tab.key ? 'text-text-strong font-semibold' : 'text-text-disabled'}>
                {tab.label}
              </span>
              {activeSection === tab.key && (
                <span className="bg-primary absolute bottom-0 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Info section ── */}
      <div ref={infoRef}>
        <InfoSection
          detail={detail}
          isLoading={vm.isLoading}
          onCopyAddress={vm.copyAddress}
          formatCurrentFee={vm.formatCurrentFee}
        />
      </div>

      {/* ── Recommend section ── */}
      {isRecommendLoaded && recommendItems.length > 0 && (
        <>
          <div className="bg-bg-weak h-2.5" />
          <div ref={recommendRef} className="bg-bg-white px-4 pt-5 pb-6">
            <h2 className="text-text-strong mb-4 text-base font-bold">추천 주차장</h2>
            <div className="flex flex-col gap-5">
              {recommendItems.map((item) => (
                <RecommendCard key={item.seq} item={item} onClick={() => router.push(`/parking/${item.seq}`)} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Nearby / AI section ── */}
      {detail?.aiDescription && (
        <>
          <div className="bg-bg-weak h-2.5" />
          <div ref={nearbyRef} className="bg-bg-white px-4 pt-5 pb-6">
            <h2 className="text-text-strong mb-4 text-base font-bold">주변 정보</h2>
            <div
              className="border-stroke-soft flex gap-2.5 rounded-lg border p-3"
              style={{ background: 'linear-gradient(130deg, #F0EBFF 0%, #F0F9FF 100%)' }}
            >
              <div className="mt-1 shrink-0">
                <div
                  className="flex size-6 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                  style={{ background: 'linear-gradient(137deg, #F49DFF 8%, #09F 120%)' }}
                >
                  AI
                </div>
              </div>
              <p className="text-text-strong text-[15px] leading-[1.65]">{detail.aiDescription.response}</p>
            </div>
          </div>
        </>
      )}

      <div className="h-24" />

      {/* ── Floating 지도보기 button ── */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center">
        <button
          onClick={() => router.push('/map')}
          className="bg-primary text-static-white shadow-02 pointer-events-auto flex h-11 cursor-pointer items-center gap-1.5 rounded-full px-5 text-sm font-semibold"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              fill="currentColor"
            />
          </svg>
          지도보기
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function TicketStubCard({ ticket, onClick }: { ticket: TicketListItem; onClick: () => void }) {
  const isDisabled = ticket.isSoldOut || !ticket.isOpen
  const description = getTicketDescription(ticket)

  return (
    <div
      className={`relative w-[176px] shrink-0 cursor-pointer ${isDisabled ? 'opacity-50' : ''}`}
      onClick={() => !isDisabled && onClick()}
    >
      <div
        className={`relative flex flex-col rounded-md border ${
          isDisabled ? 'border-stroke-soft bg-bg-soft' : 'border-primary/25 bg-primary/5'
        }`}
      >
        {/* Left notch */}
        <div
          className={`bg-bg-white absolute top-1/2 -left-px h-3 w-1.5 -translate-y-1/2 rounded-r-full border-y border-r ${
            isDisabled ? 'border-stroke-soft' : 'border-primary/25'
          }`}
        />
        {/* Right notch */}
        <div
          className={`bg-bg-white absolute top-1/2 -right-px h-3 w-1.5 -translate-y-1/2 rounded-l-full border-y border-l ${
            isDisabled ? 'border-stroke-soft' : 'border-primary/25'
          }`}
        />

        <div className="flex items-center justify-between gap-2 px-3 py-3">
          <span className={`truncate text-sm font-medium ${isDisabled ? 'text-text-disabled' : 'text-text-strong'}`}>
            {ticket.couponName}
          </span>
          <span className={`shrink-0 text-base font-bold ${isDisabled ? 'text-text-disabled' : 'text-primary'}`}>
            {ticket.price.toLocaleString()}원
          </span>
        </div>

        <div className={`mx-2 border-t border-dashed ${isDisabled ? 'border-stroke-soft' : 'border-primary/25'}`} />

        <div className="px-3 py-1.5">
          <span className={`block truncate text-[11px] ${isDisabled ? 'text-text-disabled' : 'text-text-sub'}`}>
            {description}
          </span>
        </div>
      </div>
    </div>
  )
}

function getTicketDescription(ticket: TicketListItem): string {
  if (ticket.isOpen || Number(ticket.couponTypeGroup) === CouponTypeGroup.MONTHLY)
    return `${ticket.usingDateLabel} ${ticket.usingTimeLabel}`
  return ticket.nextTimeLabel
}

function InfoSection({
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
      <div className="bg-bg-white flex flex-col gap-4 p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-soft h-16 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }
  if (!detail) return null

  const { basic, times, prices, modifyDate, openFree } = detail
  const currentFee = formatCurrentFee(basic.calcPrices)
  const address = basic.newAddress || basic.address
  const operationTime = openFree.operationTime?.replace(/익일\s*/g, '') ?? null
  const hasPrices = prices.length > 0 && prices[0].contents.length > 0
  const hasTimes = times.length > 0 && times[0].contents.length > 0

  return (
    <div className="bg-bg-white flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-text-strong text-base font-bold">주차 정보</h2>
        {modifyDate && (
          <span className="text-text-soft flex items-center gap-1 text-[12px]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#A3A3A3" strokeWidth="1.5" />
              <path d="M12 7v5l3 3" stroke="#A3A3A3" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            정보 업데이트: {formatModifyDate(modifyDate)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {!hasTimes && operationTime && <InfoRow label="운영 시간" value={operationTime} />}
        {!hasPrices && currentFee && <InfoRow label="현장 요금" value={currentFee} />}
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-sub shrink-0 text-[15px]">주소</span>
          <button
            className="flex min-w-0 cursor-pointer items-center gap-1 text-right"
            onClick={() => onCopyAddress(address)}
          >
            <span className="text-text-strong truncate text-[15px]">{address}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect x="9" y="9" width="11" height="11" rx="1.5" stroke="#A3A3A3" strokeWidth="1.5" />
              <path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" stroke="#A3A3A3" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        {basic.phone && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-text-sub shrink-0 text-[15px]">주차장번호</span>
            <a href={`tel:${basic.phone}`} className="text-primary text-[15px]">
              {basic.phone}
            </a>
          </div>
        )}
      </div>

      {hasPrices && <InfoCardSection icon="fare" title={prices[0].title} contents={prices[0].contents.slice(0, 4)} />}
      {hasTimes && <InfoCardSection icon="clock" title={times[0].title} contents={times[0].contents} />}

      {basic.options.length > 0 && (
        <div className="border-stroke-soft flex flex-col gap-3 rounded-xl border p-4">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 3h14a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zM5 13h14a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2z"
                stroke="#A3A3A3"
                strokeWidth="1.5"
              />
            </svg>
            <span className="text-text-sub text-[15px] font-semibold">추가 정보</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {basic.options.map((opt) => (
              <span key={opt} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-[13px] font-medium">
                {opt}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
          <path d="M12 2L2 20h20L12 2z" stroke="#C9A227" strokeWidth="1.5" />
          <path d="M12 9v5M12 16.5v.5" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="text-[12px] leading-relaxed text-[#7A6D33]">
          현장 정보와 일치하지 않아 발생한 피해는 모두의주차장이 책임을 지거나 보상하지 않습니다.
        </p>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-sub shrink-0 text-[15px]">{label}</span>
      <span className="text-text-strong text-right text-[15px]">{value}</span>
    </div>
  )
}

function InfoCardSection({
  icon,
  title,
  contents
}: {
  icon: 'fare' | 'clock'
  title: string
  contents: ParkingLotTimeContent['contents']
}) {
  return (
    <div className="border-stroke-soft flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        {icon === 'fare' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="6" width="20" height="14" rx="2" stroke="#A3A3A3" strokeWidth="1.5" />
            <path d="M2 10h20" stroke="#A3A3A3" strokeWidth="1.5" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#A3A3A3" strokeWidth="1.5" />
            <path d="M12 7v5l3 3" stroke="#A3A3A3" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
        <span className="text-text-sub text-[15px] font-semibold">{title}</span>
      </div>
      <div className="flex flex-col gap-2">
        {contents.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3">
            <span className="text-text-sub text-[13px]">{item.key}</span>
            <span className="text-text-strong text-right text-[13px]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecommendCard({
  item,
  onClick
}: {
  item: ReturnType<typeof useRecommendParkingViewModel>['items'][number]
  onClick: () => void
}) {
  const ticketText =
    item.tickets.length === 0
      ? null
      : item.tickets.length === 1
        ? `${item.tickets[0].name} ${item.tickets[0].price.toLocaleString()}원`
        : `${item.tickets[0].name} ${item.tickets[0].price.toLocaleString()}원 외 ${item.tickets.length - 1}개`

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="relative h-[180px] w-full cursor-pointer overflow-hidden rounded-xl" onClick={onClick}>
        {item.photos[0] ? (
          <Image
            src={item.photos[0]}
            alt={item.name}
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover"
          />
        ) : (
          <Image src="/images/img_skeleton.png" alt="" fill sizes="480px" className="object-cover" />
        )}
      </div>
      <div className="flex items-center justify-between">
        <button className="flex cursor-pointer items-center gap-0.5" onClick={onClick}>
          <span className="text-text-strong max-w-[55vw] truncate text-base font-bold">{item.name}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-text-sub flex items-center gap-1.5 text-sm">
          <span>{item.qty ? `${item.qty.toLocaleString()}면` : '정보없음'}</span>
          <span className="text-text-disabled">·</span>
          <span>{item.distance.toLocaleString()}m</span>
        </div>
      </div>
      {ticketText && <p className="text-primary text-sm font-medium">{ticketText}</p>}
    </div>
  )
}
