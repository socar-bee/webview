import { useEffect, useMemo, useState } from 'react'

import { fetchPointBalance } from '@/api/user'
import { sendPaymentResult } from '@/bridge/appBridge'

// [목업] 실제 결제준비 API 연동은 다음 단계 (앱→웹 인증토큰 전달 선결).
// 네이티브 TicketPaymentContentScreen(daily) 디자인 그대로 재현.
const MOCK = {
  parkinglotName: '강남역 공영주차장',
  ticketName: '일일주차권',
  period: '2026.06.18 (목)',
  predictTime: '오후 2:00 입차',
  carNumber: '12가 3456',
  basePrice: 10000,
  coupon: { name: '신규가입 할인', discount: 2000, count: 2 },
  pointBalance: 1500
}

type PayMethod = 'card' | 'naverpay' | 'phone'

const won = (n: number) => `${n.toLocaleString()}원`

function DailyPaymentView({ seq }: { seq: number }) {
  const [point, setPoint] = useState(0)
  const [pointBalance, setPointBalance] = useState(MOCK.pointBalance)
  const [method, setMethod] = useState<PayMethod>('card')
  const [priceOpen, setPriceOpen] = useState(true)
  const [receipt, setReceipt] = useState(false)

  // 앱이 주입한 토큰으로 실제 포인트 잔액 조회 (dev API)
  useEffect(() => {
    fetchPointBalance()
      .then(setPointBalance)
      .catch((e) => console.error('포인트 조회 실패:', e))
  }, [])

  const couponDiscount = MOCK.coupon.discount
  const maxPoint = Math.min(pointBalance, MOCK.basePrice - couponDiscount)
  const finalPrice = useMemo(() => Math.max(0, MOCK.basePrice - couponDiscount - point), [point, couponDiscount])

  return (
    <div className="bg-010 flex min-h-screen flex-col">
      {/* 헤더는 앱 WebViewActivity 툴바가 제공하므로 생략 */}
      <main className="flex-1 overflow-y-auto pb-[88px]">
        {/* 1. 주차권 정보 */}
        <section className="border-020 border-b-[10px] px-4 py-5">
          <h2 className="body-1 text-text-090 mb-4 font-bold">{MOCK.ticketName}</h2>
          <InfoRow label="주차장" value={MOCK.parkinglotName} />
          <InfoRow label="이용기간" value={MOCK.period} />
          <InfoRow label="입차 예정시간" value={MOCK.predictTime} selectable />
          <InfoRow label="차량번호" value={MOCK.carNumber} selectable />
        </section>

        {/* 2. 쿠폰 */}
        <section className="border-030 border-b px-4 py-5">
          <div className="flex items-center justify-between">
            <span className="body-3 text-text-090 font-bold">쿠폰</span>
            <button className="caption-2 text-text-090 border-050 rounded border px-3 py-1.5">쿠폰선택</button>
          </div>
          <p className="body-3 text-text-090 mt-3">
            {MOCK.coupon.name} <span className="text-main-050">-{won(couponDiscount)}</span>
          </p>
          <p className="caption-2 text-text-070 mt-1">보유 {MOCK.coupon.count}개</p>
        </section>

        {/* 3. 충전금 */}
        <section className="border-020 border-b-[10px] px-4 py-5">
          <div className="flex items-center justify-between">
            <span className="body-3 text-text-090 font-bold">충전금</span>
            <button className="caption-2 text-main-050">충전하기</button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="border-020 focus-within:border-070 flex flex-1 items-center rounded border px-3 py-2.5">
              <input
                type="number"
                inputMode="numeric"
                value={point || ''}
                onChange={(e) => setPoint(Math.max(0, Math.min(Number(e.target.value) || 0, maxPoint)))}
                placeholder="0"
                className="body-2 text-text-090 w-full bg-transparent outline-none"
              />
              <span className="body-2 text-text-070">P</span>
            </div>
            <button
              className="caption-1 text-text-090 border-050 shrink-0 rounded border px-3 py-2.5"
              onClick={() => setPoint(maxPoint)}
            >
              모두사용
            </button>
          </div>
          <p className="caption-2 text-text-070 mt-1">보유 {pointBalance.toLocaleString()}P</p>
        </section>

        {/* 4. 결제금액 */}
        <section className="border-030 border-b px-4 py-5">
          <button className="flex w-full items-center justify-between" onClick={() => setPriceOpen((v) => !v)}>
            <span className="body-3 text-text-090 font-bold">결제 금액</span>
            <span className="body-3 text-text-090 font-bold">
              {won(finalPrice)} <span className="text-text-050 text-[10px]">{priceOpen ? '▲' : '▼'}</span>
            </span>
          </button>
          {priceOpen && (
            <div className="mt-4 flex flex-col gap-2">
              <PriceRow label="상품 금액" value={won(MOCK.basePrice)} />
              <PriceRow label="쿠폰 할인" value={`-${won(couponDiscount)}`} discount />
              {point > 0 && <PriceRow label="충전금 사용" value={`-${point.toLocaleString()}P`} discount />}
            </div>
          )}
        </section>

        {/* 5. 결제수단 */}
        <section className="px-4 py-5">
          <h2 className="body-3 text-text-090 mb-3 font-bold">결제 수단</h2>
          <MethodRadio label="신용/체크카드" selected={method === 'card'} onClick={() => setMethod('card')} />
          {method === 'card' && (
            <div className="border-030 mt-3 mb-2 rounded-lg border p-4">
              <div className="bg-020 flex h-[88px] items-center justify-center rounded-md">
                <span className="caption-1 text-text-070">+ 새 카드 추가</span>
              </div>
            </div>
          )}
          <MethodRadio label="다른 결제 수단" selected={method !== 'card'} onClick={() => setMethod('naverpay')} />
          {method !== 'card' && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MethodChip label="네이버페이" selected={method === 'naverpay'} onClick={() => setMethod('naverpay')} />
              <MethodChip label="휴대폰" selected={method === 'phone'} onClick={() => setMethod('phone')} />
            </div>
          )}
        </section>

        {/* 6. 영수증 */}
        <section className="border-030 border-t px-4 py-4">
          <button className="flex w-full items-center justify-between" onClick={() => setReceipt((v) => !v)}>
            <span className="flex items-center gap-2">
              <span
                className={`flex h-[18px] w-[18px] items-center justify-center rounded-sm border text-[11px] ${
                  receipt ? 'border-main-050 bg-main-050 text-text-010' : 'border-050'
                }`}
              >
                {receipt && '✓'}
              </span>
              <span className="body-3 text-text-090">영수증(현금영수증) 신청</span>
            </span>
            <span className="caption-2 text-text-070 underline">이메일등록</span>
          </button>
        </section>
      </main>

      {/* 하단 고정 결제버튼 */}
      <footer className="bg-010 border-030 fixed bottom-0 left-1/2 w-full max-w-[768px] -translate-x-1/2 border-t px-4 py-3">
        <button
          className="btn-full bg-main-050 text-text-010 body-2 py-3.5 font-bold"
          onClick={() => sendPaymentResult({ status: 'success', orderId: `mock-daily-${seq}` })}
        >
          {won(finalPrice)} 결제하기
        </button>
      </footer>
    </div>
  )
}

function InfoRow({ label, value, selectable }: { label: string; value: string; selectable?: boolean }) {
  return (
    <div className="flex items-center justify-between py-[5px]">
      <span className="body-3 text-text-070">{label}</span>
      <span className={`body-3 text-text-090 ${selectable ? 'underline' : ''}`}>{value}</span>
    </div>
  )
}

function PriceRow({ label, value, discount }: { label: string; value: string; discount?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="body-3 text-text-070">{label}</span>
      <span className={`body-3 ${discount ? 'text-main-050' : 'text-text-090'}`}>{value}</span>
    </div>
  )
}

function MethodRadio({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button className="flex w-full items-center gap-3 py-2" onClick={onClick}>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          selected ? 'border-main-050' : 'border-050'
        }`}
      >
        {selected && <span className="bg-main-050 h-2.5 w-2.5 rounded-full" />}
      </span>
      <span className="body-3 text-text-090">{label}</span>
    </button>
  )
}

function MethodChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      className={`body-3 rounded-md border py-3 text-center ${
        selected ? 'border-main-050 text-text-090' : 'border-050 text-text-070'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export default DailyPaymentView
