'use client'

import DockBar from '@/shared/components/layout/DockBar'

import { useTicketDetailViewModel } from '../viewmodel'
import type { ParkingLotDetail, TicketDetail, TicketListItem } from '@/shared/types/parking'

interface TicketDetailViewProps {
  couponSeq: number
  initialTicket?: TicketDetail
  parkingTickets?: TicketListItem[]
  pin?: ParkingLotDetail
}

export default function TicketDetailView({ couponSeq, initialTicket, parkingTickets, pin }: TicketDetailViewProps) {
  const vm = useTicketDetailViewModel({ couponSeq, initialTicket, parkingTickets, pin })

  if (vm.isLoading || !vm.ticket) {
    return (
      <div className="flex h-full flex-col">
        <main className="flex flex-1 items-center justify-center">
          <div className="text-text-soft text-[14px]">로딩 중…</div>
        </main>
        <DockBar />
      </div>
    )
  }

  const t = vm.ticket
  const parkinglotName = pin?.basic.name
  const address = pin?.basic.newAddress || pin?.basic.address

  return (
    <div className="flex h-full flex-col">
      <main className="bg-bg-weak scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* ─── Sticky Header ─── */}
        <header className="bg-bg-white border-stroke-soft/60 sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between border-b px-2">
          <button
            onClick={vm.goBack}
            aria-label="뒤로"
            className="flex size-10 cursor-pointer items-center justify-center"
          >
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
          <h1 className="text-text-strong text-[16px] font-bold">주차권 상세</h1>
          <div className="size-10" />
        </header>

        {/* ─── Hero — primary 톤 카드 ─── */}
        <section className="bg-bg-white px-5 pt-5 pb-6">
          <div
            className="border-stroke-soft relative overflow-hidden rounded-[16px] border p-5"
            style={{ background: 'linear-gradient(135deg, #F0F8FF 0%, #E1F0FF 100%)' }}
          >
            <span aria-hidden className="bg-primary/10 absolute -top-10 -right-10 size-32 rounded-full blur-2xl" />
            {parkinglotName && (
              <p className="text-primary relative z-10 text-[12px] font-semibold tracking-[-0.2px]">{parkinglotName}</p>
            )}
            <h2 className="text-text-strong relative z-10 mt-1.5 text-[22px] leading-[1.25] font-extrabold tracking-[-0.4px]">
              {t.couponName}
            </h2>
            <p className="text-text-strong relative z-10 mt-3 text-[26px] leading-none font-extrabold tabular-nums">
              {t.price.toLocaleString()}
              <span className="text-text-sub ml-0.5 text-[15px] font-bold">원</span>
            </p>
            {t.usagePeriodLabel && (
              <p className="text-text-sub relative z-10 mt-2 inline-flex items-center gap-1 text-[13px]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="9" stroke="#A3A3A3" strokeWidth="1.5" />
                  <path d="M12 7v5l3 3" stroke="#A3A3A3" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {t.usagePeriodLabel}
              </p>
            )}
          </div>
        </section>

        {/* ─── 같은 주차장 주차권 (가로 스크롤 pill) ─── */}
        {vm.tabs.length > 0 && (
          <section className="bg-bg-white pb-5">
            <p className="text-text-sub px-5 pb-2 text-[12px] font-semibold">같은 주차장 주차권</p>
            <div className="scrollbar-hide overflow-x-auto">
              <ul className="flex w-max gap-2 px-5">
                {vm.tabs.map((tab) => (
                  <li key={tab.couponSeq}>
                    <button
                      onClick={() => vm.goToTicketDetail(tab.couponSeq)}
                      className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                        tab.isActive
                          ? 'border-primary bg-primary text-static-white'
                          : 'border-stroke-soft bg-bg-white text-text-sub hover:text-text-strong'
                      }`}
                    >
                      {tab.couponName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ─── 안내사항 카드 모음 ─── */}
        <section className="flex flex-col gap-2.5 px-5 py-2">
          {t.notice && <NoticeCard icon="info" title="안내사항" body={t.notice} />}
          {t.notice2 && <NoticeCard icon="caution" title="결제 전 유의사항" body={t.notice2} />}
          {t.enteringNotice && <NoticeCard icon="car" title="입출차 주의사항" body={t.enteringNotice} />}
        </section>

        {/* ─── 주차장 정보 단축 진입 ─── */}
        {pin && (
          <section className="bg-bg-white border-stroke-soft/60 mt-2 border-t px-5 py-4">
            <button
              onClick={() => vm.goToParkinglotDetail(pin.seq)}
              className="flex w-full cursor-pointer items-center justify-between text-left"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-text-strong text-[14px] font-semibold">주차장 정보</span>
                {address && <span className="text-text-soft truncate text-[12px]">{address}</span>}
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-text-disabled shrink-0">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </section>
        )}

        <div className="h-6" />

        {/* ─── Sticky 구매 버튼 ─── */}
        <footer className="bg-bg-white border-stroke-soft/60 sticky bottom-0 border-t px-5 pt-3 pb-4">
          <button
            onClick={vm.handleClickPurchase}
            disabled={vm.purchaseButton.disabled}
            className={`w-full rounded-[14px] py-4 font-bold whitespace-pre-line transition-all ${
              vm.purchaseButton.disabled
                ? 'bg-bg-soft text-text-disabled cursor-default'
                : 'bg-primary text-static-white cursor-pointer active:scale-[0.98]'
            } ${vm.purchaseButton.fontSize === 'caption' ? 'text-[12px] leading-[1.45]' : 'text-[15px]'}`}
          >
            {vm.purchaseButton.text}
          </button>
        </footer>
      </main>

      <DockBar />
    </div>
  )
}

/* ─── Notice Card ─── */
function NoticeCard({ icon, title, body }: { icon: 'info' | 'caution' | 'car'; title: string; body: string }) {
  return (
    <div className="bg-bg-white border-stroke-soft rounded-[14px] border px-4 py-4">
      <div className="flex items-center gap-2">
        <NoticeIcon kind={icon} />
        <h3 className="text-text-strong text-[14px] font-bold tracking-[-0.2px]">{title}</h3>
      </div>
      <p className="text-text-sub mt-2.5 text-[13px] leading-[1.65] whitespace-pre-wrap">{body}</p>
    </div>
  )
}

function NoticeIcon({ kind }: { kind: 'info' | 'caution' | 'car' }) {
  const tone =
    kind === 'caution'
      ? { bg: 'bg-[#FFF6E0]', color: '#C9A227' }
      : { bg: 'bg-primary/10', color: 'var(--color-primary)' }
  return (
    <span
      className={`flex size-7 shrink-0 items-center justify-center rounded-full ${tone.bg}`}
      style={{ color: tone.color }}
    >
      {kind === 'info' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v4M12 15.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
      {kind === 'caution' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 20h20L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M12 9v5M12 16.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
      {kind === 'car' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
        </svg>
      )}
    </span>
  )
}
