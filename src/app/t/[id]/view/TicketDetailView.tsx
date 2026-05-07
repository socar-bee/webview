'use client'

import { useTicketDetailViewModel } from '../viewmodel'
import type { ParkingLotDetail, TicketDetail, TicketListItem } from '@/shared/types/parking'

interface TicketDetailViewProps {
  couponSeq: number
  initialTicket?: TicketDetail
  parkingTickets?: TicketListItem[]
  pin?: ParkingLotDetail
}

/**
 * 주차권 상세 — UI/UX는 추후 풀페이지로 별도 구현 예정.
 * 현재는 viewmodel 동작 확인용 최소 스캐폴드.
 */
export default function TicketDetailView({ couponSeq, initialTicket, parkingTickets, pin }: TicketDetailViewProps) {
  const vm = useTicketDetailViewModel({ couponSeq, initialTicket, parkingTickets, pin })

  if (vm.isLoading || !vm.ticket) {
    return (
      <main className="bg-bg-white flex min-h-full items-center justify-center">
        <div className="text-text-soft text-[14px]">로딩 중…</div>
      </main>
    )
  }

  const t = vm.ticket
  return (
    <main className="bg-bg-white flex min-h-full flex-col">
      {/* Header */}
      <header className="border-stroke-soft flex h-14 shrink-0 items-center justify-between border-b px-4">
        <button onClick={vm.goBack} className="text-text-strong text-[14px]" aria-label="뒤로">
          ← 뒤로
        </button>
        <h1 className="text-text-strong text-[16px] font-bold">주차권 상세</h1>
        <div className="size-10" />
      </header>

      <div className="flex-1 px-5 py-6">
        {/* 기본 정보 */}
        <section className="flex flex-col gap-2">
          <p className="text-text-sub text-[12px]">{pin?.basic.name}</p>
          <h2 className="text-text-strong text-[20px] font-extrabold tracking-[-0.3px]">{t.couponName}</h2>
          <p className="text-text-strong text-[18px] font-bold">{t.price.toLocaleString()}원</p>
          {t.usagePeriodLabel && <p className="text-text-sub text-[13px]">{t.usagePeriodLabel}</p>}
        </section>

        {/* 같은 주차장의 다른 주차권 (탭) */}
        {vm.tabs.length > 0 && (
          <section className="mt-6">
            <p className="text-text-sub mb-2 text-[12px] font-medium">같은 주차장 주차권</p>
            <ul className="flex flex-wrap gap-2">
              {vm.tabs.map((tab) => (
                <li key={tab.couponSeq}>
                  <button
                    onClick={() => vm.goToTicketDetail(tab.couponSeq)}
                    className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                      tab.isActive
                        ? 'bg-primary text-static-white border-primary'
                        : 'bg-bg-soft text-text-sub border-stroke-soft'
                    }`}
                  >
                    {tab.couponName}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 안내 / 결제 전 유의 / 입출차 */}
        {t.notice && (
          <Section title="안내사항">
            <p>{t.notice}</p>
          </Section>
        )}
        {t.notice2 && (
          <Section title="결제 전 유의사항">
            <p>{t.notice2}</p>
          </Section>
        )}
        {t.enteringNotice && (
          <Section title="입출차 주의사항">
            <p>{t.enteringNotice}</p>
          </Section>
        )}

        {/* 주차장 위치 단축 진입 */}
        {pin && (
          <section className="mt-6">
            <button
              onClick={() => vm.goToParkinglotDetail(pin.seq)}
              className="text-primary text-[13px] font-semibold underline-offset-2 hover:underline"
            >
              주차장 정보 보기 →
            </button>
          </section>
        )}
      </div>

      {/* Sticky 구매 버튼 */}
      <footer className="border-stroke-soft sticky bottom-0 border-t bg-white px-5 py-3">
        <button
          onClick={vm.handleClickPurchase}
          disabled={vm.purchaseButton.disabled}
          className={`w-full rounded-[12px] py-4 font-bold whitespace-pre-line transition-all ${
            vm.purchaseButton.disabled
              ? 'bg-bg-soft text-text-disabled cursor-default'
              : 'bg-primary text-static-white cursor-pointer active:scale-[0.98]'
          } ${vm.purchaseButton.fontSize === 'caption' ? 'text-[12px] leading-[1.4]' : 'text-[15px]'}`}
        >
          {vm.purchaseButton.text}
        </button>
      </footer>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="text-text-strong mb-2 text-[14px] font-bold">{title}</h3>
      <div className="text-text-sub text-[13px] leading-[1.6] whitespace-pre-wrap">{children}</div>
    </section>
  )
}
