'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { DETAIL_TABS, useParkingDetailViewModel } from '../viewmodel'
import type { ParkingLotDetail, ParkingLotTimeContent } from '@/shared/types/parking'

interface ParkingDetailViewProps {
  seq: number
  initialDetail?: ParkingLotDetail
}

export default function ParkingDetailView({ seq, initialDetail }: ParkingDetailViewProps) {
  const router = useRouter()
  const vm = useParkingDetailViewModel(seq, undefined, initialDetail)
  const detail = vm.detail

  return (
    <div className="scrollbar-hide bg-bg-weak flex min-h-screen flex-col overflow-y-auto">
      {/* 헤더 */}
      <header className="bg-bg-white flex items-center gap-2 px-2 py-3">
        <button onClick={() => router.back()} className="flex size-10 items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="#171717"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-text-strong flex-1 truncate text-[17px] font-bold">
          {detail?.basic.name ?? '주차장 상세'}
        </h1>
      </header>

      {/* 주차장 정보 헤더 */}
      <div className="bg-bg-white px-6 pt-4 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-text-strong text-[20px] leading-normal font-bold">{detail?.basic.name ?? ''}</h2>
            <p className="text-text-sub mt-0.5 flex items-center gap-1.5 text-[14px]">
              {detail?.basic.partnerStatus && <span>제휴</span>}
              {detail?.basic.partnerStatus && detail?.basic.qty != null && (
                <svg width="4" height="4" viewBox="0 0 4 4" fill="none">
                  <circle cx="2" cy="2" r="2" fill="#A3A3A3" />
                </svg>
              )}
              {detail?.basic.qty != null && <span>{detail.basic.qty.toLocaleString()}면</span>}
            </p>
          </div>
          <button className="bg-primary text-static-white rounded-8 flex size-[53px] shrink-0 flex-col items-center justify-center gap-0.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="currentColor"
              />
            </svg>
            <span className="text-[10px] font-medium tracking-[0.3px]">길찾기</span>
          </button>
        </div>
      </div>

      {/* 사진 갤러리 */}
      {detail?.basic.photos && detail.basic.photos.length > 0 && (
        <div className="bg-bg-white mt-2.5">
          <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 py-4">
            {detail.basic.photos.map((photo, i) => (
              <motion.div
                key={i}
                className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
              >
                <Image
                  src={photo.file_name}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                  onError={(e) => {
                    const wrapper = (e.target as HTMLElement).closest('.relative') as HTMLElement | null
                    if (wrapper) wrapper.style.display = 'none'
                    const gallery = wrapper?.parentElement
                    if (
                      gallery &&
                      Array.from(gallery.children).every((c) => (c as HTMLElement).style.display === 'none')
                    ) {
                      ;(gallery.closest('.bg-bg-white') as HTMLElement | null)!.style.display = 'none'
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-stroke-soft bg-bg-white sticky top-0 z-10 mt-2.5 border-b">
        <div className="flex">
          {DETAIL_TABS.map((tab) => {
            const isActive = tab.key === vm.activeTab
            return (
              <button
                key={tab.key}
                onClick={() => vm.setActiveTab(tab.key)}
                className={`relative flex-1 py-3.5 text-[15px] font-semibold transition-colors ${
                  isActive ? 'text-text-strong' : 'text-text-disabled'
                }`}
              >
                {tab.label}
                {isActive && <span className="bg-primary absolute inset-x-0 bottom-0 h-1 rounded-full" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1">
        {vm.activeTab === 'tickets' && (
          <TicketsSection tickets={vm.tickets} isLoading={vm.isLoading} onBuy={vm.goToPayment} />
        )}
        {vm.activeTab === 'info' && (
          <InfoSection
            detail={detail}
            isLoading={vm.isLoading}
            onCopyAddress={vm.copyAddress}
            formatCurrentFee={vm.formatCurrentFee}
          />
        )}
        {vm.activeTab === 'recommend' && <RecommendSection />}
        {vm.activeTab === 'nearby' && <NearbySection detail={detail} />}
      </div>

      {/* 지도보기 플로팅 버튼 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 flex justify-center">
        <button
          onClick={() => router.push('/map')}
          className="bg-primary text-static-white shadow-02 pointer-events-auto flex h-11 items-center gap-1.5 rounded-full px-5 text-[14px] font-semibold"
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

/* ─── TicketsSection ─── */
function TicketsSection({
  tickets,
  isLoading,
  onBuy
}: {
  tickets: ReturnType<typeof useParkingDetailViewModel>['tickets']
  isLoading: boolean
  onBuy: (couponSeq: number) => void
}) {
  return (
    <div className="bg-bg-white flex flex-col gap-6 p-6">
      <h2 className="text-text-strong text-[20px] font-semibold tracking-[-0.3px]">주차권</h2>
      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-soft h-[86px] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {tickets.map((ticket) => {
            const isDisabled = !ticket.isOpen || ticket.isSoldOut
            return (
              <div key={ticket.couponSeq} className="flex overflow-hidden rounded-lg">
                <div className={`w-[9px] shrink-0 ${isDisabled ? 'bg-stroke-sub' : 'bg-primary'}`} />
                <div
                  className={`border-stroke-sub flex flex-1 items-center gap-3.5 rounded-tr-lg rounded-br-lg border-t border-r border-b px-4 py-2.5 ${
                    isDisabled ? 'bg-bg-weak' : 'bg-bg-white'
                  }`}
                >
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span
                      className={`text-[14px] font-semibold ${isDisabled ? 'text-text-disabled' : 'text-text-strong'}`}
                    >
                      {ticket.couponName}
                    </span>
                    <span className={`text-[16px] font-bold ${isDisabled ? 'text-text-disabled' : 'text-text-strong'}`}>
                      {ticket.price.toLocaleString()}원
                    </span>
                    <div className="flex items-center gap-1 text-[12px]">
                      <span className={`font-semibold ${isDisabled ? 'text-text-disabled' : 'text-primary'}`}>
                        {ticket.isSoldOut ? '매진' : ticket.isOpen ? '판매중' : ticket.nextTimeLabel}
                      </span>
                      <svg width="4" height="4" viewBox="0 0 4 4" fill="none">
                        <circle cx="2" cy="2" r="2" fill={isDisabled ? '#D1D1D1' : '#A3A3A3'} />
                      </svg>
                      <span className={isDisabled ? 'text-text-disabled' : 'text-text-sub'}>
                        {ticket.usingDateLabel}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => !isDisabled && onBuy(ticket.couponSeq)}
                    disabled={isDisabled}
                    className={`shrink-0 text-[14px] font-bold ${
                      isDisabled ? 'text-text-disabled cursor-default' : 'text-text-strong'
                    }`}
                  >
                    구매하기
                  </button>
                </div>
              </div>
            )
          })}
          {tickets.length === 0 && (
            <p className="text-text-soft py-6 text-center text-[14px]">판매 중인 주차권이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── InfoSection ─── */
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
  if (isLoading || !detail) {
    return (
      <div className="bg-bg-white flex flex-col gap-4 p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-soft h-20 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  const { basic, times, prices, modifyDate, openFree } = detail
  const currentFee = formatCurrentFee(basic.calcPrices)

  return (
    <div className="bg-bg-white flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-text-strong text-[20px] font-semibold tracking-[-0.3px]">주차정보</h2>
        {modifyDate && (
          <span className="text-text-soft flex items-center gap-1 text-[12px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#A3A3A3" strokeWidth="1.5" />
              <path d="M12 7v5l3 3" stroke="#A3A3A3" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            정보 업데이트: {modifyDate}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {openFree.operationTime && <InfoRow label="운영 시간" value={openFree.operationTime} />}
        {currentFee && <InfoRow label="현장 요금" value={currentFee} />}
        <div className="flex items-center justify-between">
          <span className="text-text-sub text-[16px]">주소</span>
          <button
            className="flex items-center gap-1 text-right"
            onClick={() => onCopyAddress(basic.newAddress || basic.address)}
          >
            <span className="text-text-strong text-[16px]">{basic.newAddress || basic.address}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="11" height="11" rx="1.5" stroke="#A3A3A3" strokeWidth="1.5" />
              <path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" stroke="#A3A3A3" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>

      <button className="border-stroke-sub text-text-sub flex h-[50px] w-full items-center justify-center rounded-md border text-[16px] font-semibold">
        로드뷰 보기
      </button>

      {prices.map((section, i) => (
        <InfoCardSection key={`fare-${i}`} icon="fare" title={section.title} contents={section.contents} />
      ))}
      {times.map((section, i) => (
        <InfoCardSection key={`time-${i}`} icon="clock" title={section.title} contents={section.contents} />
      ))}

      {basic.options.length > 0 && (
        <div className="border-stroke-soft flex flex-col gap-3 rounded-xl border p-[17px]">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                stroke="#A3A3A3"
                strokeWidth="1.5"
              />
            </svg>
            <span className="text-text-sub text-[16px] font-semibold">추가 정보</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {basic.options.map((opt) => (
              <span key={opt} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-[14px] font-semibold">
                {opt}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl bg-[#FFF9D6] p-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
          <path d="M12 2L2 20h20L12 2z" stroke="#C9A227" strokeWidth="1.5" />
          <path d="M12 9v5M12 16.5v.5" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="text-[12px] leading-[1.7] text-[#7A6D33]">
          현장 정보와 일치하지 않아 발생한 피해는 모두의주차장이 책임을 지거나 보상하지 않습니다.
        </p>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-sub text-[16px]">{label}</span>
      <span className="text-text-strong text-[16px]">{value}</span>
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
    <div className="border-stroke-soft flex flex-col gap-3 rounded-xl border p-[17px]">
      <div className="flex items-center gap-2">
        {icon === 'fare' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="6" width="20" height="14" rx="2" stroke="#A3A3A3" strokeWidth="1.5" />
            <path d="M2 10h20" stroke="#A3A3A3" strokeWidth="1.5" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#A3A3A3" strokeWidth="1.5" />
            <path d="M12 7v5l3 3" stroke="#A3A3A3" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
        <span className="text-text-sub text-[16px] font-semibold">{title}</span>
      </div>
      <div className="flex flex-col gap-2">
        {contents.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <span className="text-text-sub text-[14px]">{item.key}</span>
            <span className="text-text-strong text-[14px]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── RecommendSection ─── */
function RecommendSection() {
  return (
    <div className="bg-bg-white p-6">
      <h2 className="text-text-strong mb-4 text-[20px] font-semibold">다른 주차장은 어떠세요?</h2>
      <p className="text-text-soft text-[14px]">준비 중입니다.</p>
    </div>
  )
}

/* ─── NearbySection ─── */
function NearbySection({ detail }: { detail: ReturnType<typeof useParkingDetailViewModel>['detail'] }) {
  if (!detail?.aiDescription) {
    return (
      <div className="bg-bg-white p-6">
        <h2 className="text-text-strong mb-4 text-[20px] font-semibold">주변 정보</h2>
        <p className="text-text-soft text-[14px]">주변 정보가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-bg-white flex flex-col gap-6 p-6">
      <h2 className="text-text-strong text-[20px] font-semibold">주변 정보</h2>
      <div
        className="border-stroke-soft flex gap-2.5 rounded-lg border p-3"
        style={{ background: 'linear-gradient(130deg, #F0EBFF 0%, #F0F9FF 100%)' }}
      >
        <div className="mt-1.5 shrink-0">
          <div
            className="flex size-6 items-center justify-center rounded-full text-[14px] font-semibold text-white"
            style={{ background: 'linear-gradient(137deg, #F49DFF 8%, #09F 120%)' }}
          >
            AI
          </div>
        </div>
        <p className="text-text-strong text-[16px] leading-[1.625]">{detail.aiDescription.response}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-text-sub text-[14px]">위의 요약이 도움이 되었나요?</span>
        <div className="flex gap-2">
          <button className="bg-primary/10 flex items-center rounded-full px-3.5 py-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#09F">
              <path
                d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3M14 2l-1 7h7a2 2 0 011 1.9l-1.5 7A2 2 0 0117.5 19H7V9l5-7z"
                stroke="#09F"
                strokeWidth="1.5"
              />
            </svg>
          </button>
          <button className="flex items-center rounded-full bg-[#EBEBEB] px-3.5 py-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3M10 22l1-7H4a2 2 0 01-1-1.9l1.5-7A2 2 0 016.5 5H17v10l-5 7z"
                stroke="#A3A3A3"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
