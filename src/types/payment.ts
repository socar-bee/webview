// 주차권 결제 — 도메인 타입 (안드로이드 PaymentRequestPayload / PaymentType 대응)

/** 결제수단 (안드로이드 PaymentType.code 대응) */
export const PAYMENT_METHOD = {
  CREDIT_CARD: 200, // 카드(빌링키)
  PHONE: 300, // 휴대폰 결제(모빌리언스)
  NAVER_PAY: 400, // 네이버페이
  POINT: 0 // 포인트(결제금액 0)
} as const
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]

/** PG 웹뷰 결제 종류 (webview/{pgType}) */
export type PgType = 'naverpay' | 'mobilians'

/** 주차권 타입 (6종) */
export type TicketType =
  | 'share' // 공유주차
  | 'shareExtension' // 공유주차 연장
  | 'daily' // 일일권(제휴)
  | 'monthly' // 정기권(제휴)
  | 'monthlyExtension' // 정기권 연장
  | 'period' // 예약/공항

/** 앱 → 웹 진입 컨텍스트 (식별자만 — 상세는 결제준비 API로 조회) */
export type PaymentEntry =
  | { type: 'share'; shareSeq: number }
  | { type: 'shareExtension'; shareSeq: number; parkingSeq: number }
  | { type: 'daily'; parkinglotSeq: number }
  | { type: 'monthly'; parkinglotSeq: number }
  | { type: 'monthlyExtension'; parkinglotSeq: number; parkingSeq: number }
  | { type: 'period'; parkinglotSeq: number }

/** 결제 결과 (웹 → 앱 전달) */
export interface PaymentResult {
  status: 'success' | 'fail' | 'cancel'
  orderId?: string
  message?: string
}
