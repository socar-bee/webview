// 주차권 결제 API (안드로이드 TicketApi 대응)
// endpoint 패턴: /ticket/payment[/{kind}]/{method}
//   kind: '' (일반) | 'monthly' | 'monthly/extension' | 'share'
//   method: 'point' | 'billkey' | 'webview/{pgType}'
import { apiClient } from '@/api/client'
import type { PgType } from '@/types/payment'

const BASE = '/ticket/payment'

/** 웹뷰 PG 결제 응답 (네이버페이/모빌리언스 → redirectUrl로 이동) */
export interface PaymentWebResult {
  redirectUrl: string
  successUrl: string
}

// TODO(구현): payload 타입 확정 (안드로이드 PaymentRequestPayload / TicketPaymentRepository 참조)
//   타입별·결제수단별 요청 바디 매핑은 정기권(monthly) 한 바퀴부터 채운다.

/** 포인트 결제 (결제금액 0) */
export async function payByPoint(kind: string, payload: unknown) {
  const path = kind ? `${BASE}/${kind}/point` : `${BASE}/point`
  const { data } = await apiClient.post(path, payload)
  return data
}

/** 카드(빌링키) 결제 */
export async function payByBillkey(kind: string, payload: unknown) {
  const path = kind ? `${BASE}/${kind}/billkey` : `${BASE}/billkey`
  const { data } = await apiClient.post(path, payload)
  return data
}

/** 웹뷰 PG 결제 (네이버페이/모빌리언스) */
export async function payByWebview(kind: string, pgType: PgType, payload: unknown) {
  const path = kind ? `${BASE}/${kind}/webview/${pgType}` : `${BASE}/webview/${pgType}`
  const { data } = await apiClient.post<PaymentWebResult>(path, payload)
  return data
}
