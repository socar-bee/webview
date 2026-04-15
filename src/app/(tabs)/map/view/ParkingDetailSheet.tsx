'use client'

import Image from 'next/image'
import { useEffect } from 'react'

import AnimationSheet, { type SheetSnap } from '@/shared/components/ui/AnimationSheet'

import type { ParkingLotTimeContent, ParkingLotType } from '@/shared/types/parking'

import { DETAIL_TABS, useParkingDetailViewModel } from '@/app/parking/[id]/viewmodel'

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
  /** detail 로드 완료 시 주차장 좌표를 부모에 전달 (지도 이동에 사용) */
  onLocationKnown?: (lat: number, lng: number) => void
}

export default function ParkingDetailSheet({
  isOpen,
  snap,
  onSnapChange,
  onClose,
  data,
  onLocationKnown
}: ParkingDetailSheetProps) {
  const vm = useParkingDetailViewModel(data?.seq ?? null, data?.parkingType)

  const lat = vm.detail?.basic.latitude
  const lng = vm.detail?.basic.longitude
  useEffect(() => {
    if (lat != null && lng != null) onLocationKnown?.(lat, lng)
    // onLocationKnown은 useCallback으로 안정화되어 있으므로 deps 안전
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng])

  if (!data) return null

  const detail = vm.detail
  const capacity = detail?.basic.qty
  const typeLabel = detail?.basic.partnerStatus ? '제휴' : '공영'
  const displayName = detail?.basic.name ?? data.name

  return (
    <AnimationSheet
      isOpen={isOpen}
      snap={snap}
      onSnapChange={onSnapChange}
      onClose={onClose}
      peekHeight={96}
      halfRatio={0.45}
      navigationBar={<NavigationBar title={displayName} onBack={onClose} />}
      peek={
        snap !== 'full' ? (
          <PeekBar
            name={displayName}
            typeLabel={detail ? typeLabel : data.isPartner ? '제휴' : null}
            capacity={capacity ?? null}
            onExpand={() => onSnapChange('half')}
          />
        ) : null
      }
      overlay={
        <button
          onClick={() => onSnapChange('peek')}
          className="bg-primary text-static-white shadow-02 pointer-events-auto flex h-11 items-center gap-1.5 rounded-full px-5 text-[14px] font-semibold"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
          </svg>
          지도보기
        </button>
      }
    >
      <div className="flex flex-col">
        {/* full 상태에서 PeekBar는 스크롤 영역 상단에 배치 → 스크롤 시 사라짐 */}
        {snap === 'full' && (
          <PeekBar
            name={displayName}
            typeLabel={detail ? typeLabel : data.isPartner ? '제휴' : null}
            capacity={capacity ?? null}
            onExpand={() => onSnapChange('half')}
          />
        )}

        {/* 사진 갤러리 */}
        {detail?.basic.photos && detail.basic.photos.length > 0 && (
          <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 py-4">
            {detail.basic.photos.map((photo, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={photo.thumbnail} alt="" className="size-40 shrink-0 rounded-lg object-cover" />
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="border-stroke-soft bg-bg-white sticky top-0 z-10 border-b">
          <div className="flex">
            {DETAIL_TABS.map((tab) => {
              const isActive = tab.key === vm.activeTab
              return (
                <button
                  key={tab.key}
                  onClick={() => vm.setActiveTab(tab.key)}
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

        {/* Tab content */}
        <div>
          {vm.activeTab === 'tickets' && (
            <TicketsTab tickets={vm.tickets} isLoading={vm.isLoading} onBuy={vm.goToPayment} />
          )}
          {vm.activeTab === 'info' && (
            <InfoTab
              detail={detail}
              isLoading={vm.isLoading}
              onCopyAddress={vm.copyAddress}
              formatCurrentFee={vm.formatCurrentFee}
            />
          )}
          {vm.activeTab === 'recommend' && <RecommendTab />}
          {vm.activeTab === 'nearby' && <NearbyTab detail={detail} />}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </AnimationSheet>
  )
}

/* ─── NavigationBar ─── */
function NavigationBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex h-12 items-center justify-between px-2">
      <button onClick={onBack} className="flex size-10 items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h2 className="text-text-strong text-[16px] font-bold">{title}</h2>
      <div className="size-10" />
    </div>
  )
}

/* ─── PeekBar ─── */
function PeekBar({
  name,
  typeLabel,
  capacity,
  onExpand
}: {
  name: string
  typeLabel: string | null
  capacity: number | null
  onExpand: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-2 pb-5" onClick={onExpand}>
      <div className="min-w-0 flex-1">
        <h3 className="text-text-strong truncate text-[18px] leading-[1.4] font-bold">{name}</h3>
        <p className="text-text-sub mt-0.5 flex items-center gap-1.5 text-[14px]">
          {typeLabel && <span>{typeLabel}</span>}
          {typeLabel && capacity !== null && (
            <svg width="4" height="4" viewBox="0 0 4 4" fill="none">
              <circle cx="2" cy="2" r="2" fill="#A3A3A3" />
            </svg>
          )}
          {capacity !== null && <span>{capacity.toLocaleString()}면</span>}
        </p>
      </div>
      <button
        onClick={(e) => e.stopPropagation()}
        className="bg-primary text-static-white flex size-[53px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-[8px]"
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

/* ─── TicketsTab ─── */
function TicketsTab({
  tickets,
  isLoading,
  onBuy
}: {
  tickets: ReturnType<typeof useParkingDetailViewModel>['tickets']
  isLoading: boolean
  onBuy: (couponSeq: number) => void
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 섹션 헤더 */}
      <h2 className="text-text-strong text-[20px] font-semibold tracking-[-0.3px]">주차권</h2>

      {/* 티켓 목록 */}
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
  if (isLoading || !detail) {
    return (
      <div className="flex flex-col gap-4 p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-soft h-20 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  const { basic, times, prices, modifyDate, openFree } = detail
  const currentFee = formatCurrentFee(basic.calcPrices)

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 주차정보 헤더 */}
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

      {/* 기본 정보 행 */}
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

      {/* 로드뷰 보기 */}
      <button className="border-stroke-sub text-text-sub flex h-[50px] w-full items-center justify-center rounded-md border text-[16px] font-semibold">
        로드뷰 보기
      </button>

      {/* 요금 안내 */}
      {prices.map((section) => (
        <InfoSection key={section.title} icon="fare" title={section.title} contents={section.contents} />
      ))}

      {/* 운영 시간 */}
      {times.map((section) => (
        <InfoSection key={section.title} icon="clock" title={section.title} contents={section.contents} />
      ))}

      {/* 추가 정보 */}
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

      {/* 경고 */}
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

function InfoSection({
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

/* ─── RecommendTab ─── */
function RecommendTab() {
  return (
    <div className="p-6">
      <h2 className="text-text-strong mb-6 text-[20px] font-semibold">다른 주차장은 어떠세요?</h2>
      <p className="text-text-soft text-[14px]">준비 중입니다.</p>
    </div>
  )
}

/* ─── Footer ─── */
function Footer() {
  return (
    <div className="flex flex-col">
      {/* 앱 다운로드 배너 */}
      <div className="relative h-[86px] w-full overflow-hidden">
        <Image
          src="/images/img_app_banner.webp"
          alt="모두의주차장 앱에서 더 편리하게 이용하세요"
          fill
          className="object-cover"
        />
      </div>

      {/* 사업자 정보 — pb-24로 지도보기 버튼이 마지막 콘텐츠를 가리지 않도록 여백 확보 */}
      <div className="flex flex-col gap-6 bg-[#f7f7f7] p-6 pb-24">
        <button className="border-primary text-primary h-[46px] w-full rounded-xl border text-[14px] font-medium">
          모두의 주차장 앱 다운로드
        </button>
        <div className="flex flex-col gap-1.5 text-[12px] leading-[1.5] text-[#a3a3a3]">
          <p>(주) 쏘카</p>
          <p>통신판매업 신고 : 제 2021-서울강남-04660호</p>
          <p>사업자등록번호 : 258-87-01370</p>
          <p>서비스 문의 : 1599-0110</p>
          <p>주소 : 서울특별시 강남구 테헤란로 156, 강남파이낸스센터 23층</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#a3a3a3]">
          <button className="underline-offset-2 hover:underline">이용약관</button>
          <span>|</span>
          <button className="underline-offset-2 hover:underline">개인정보처리방침</button>
          <span>|</span>
          <button className="underline-offset-2 hover:underline">위치정보 이용약관</button>
          <span>|</span>
          <button className="underline-offset-2 hover:underline">고객센터</button>
        </div>
      </div>
    </div>
  )
}

/* ─── NearbyTab ─── */
function NearbyTab({ detail }: { detail: ReturnType<typeof useParkingDetailViewModel>['detail'] }) {
  if (!detail?.aiDescription) {
    return (
      <div className="p-6">
        <h2 className="text-text-strong mb-4 text-[20px] font-semibold">주변 정보</h2>
        <p className="text-text-soft text-[14px]">주변 정보가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
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
