// 앱 ↔ 웹 통신 — parkingshare-internal:// URL scheme
// (JS Interface 미사용. 본인인증 웹뷰와 동일 패턴 = 앱의 shouldOverrideUrlLoading이 스킴을 가로챔)

import type { PaymentEntry, PaymentResult, TicketType } from '@/types/payment'

const INTERNAL_SCHEME = 'parkingshare-internal'

/** 앱으로 신호 전송 (top-level navigation으로 커스텀 스킴 이동) */
function navigateToApp(path: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params).toString()}` : ''
  window.location.href = `${INTERNAL_SCHEME}://${path}${query}`
}

/** 결제 결과를 앱으로 전달 (앱이 구매내역 갱신 + 화면 전환) */
export function sendPaymentResult(result: PaymentResult) {
  navigateToApp('payment-result', {
    status: result.status,
    ...(result.orderId ? { orderId: result.orderId } : {}),
    ...(result.message ? { message: result.message } : {})
  })
}

/** 웹뷰 닫기 */
export function closeWebView() {
  navigateToApp('close')
}

/** 진입 URL 쿼리에서 결제 컨텍스트 파싱 (앱이 식별자만 넘김) */
export function parseEntry(search: string): PaymentEntry | null {
  const p = new URLSearchParams(search)
  const type = p.get('type') as TicketType | null
  if (!type) return null

  const seq = Number(p.get('seq'))
  const parkingSeq = Number(p.get('parkingSeq'))
  if (Number.isNaN(seq)) return null

  switch (type) {
    case 'share':
      return { type, shareSeq: seq }
    case 'shareExtension':
      return { type, shareSeq: seq, parkingSeq }
    case 'daily':
    case 'monthly':
    case 'period':
      return { type, parkinglotSeq: seq }
    case 'monthlyExtension':
      return { type, parkinglotSeq: seq, parkingSeq }
    default:
      return null
  }
}
