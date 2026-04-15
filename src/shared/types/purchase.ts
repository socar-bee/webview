/* ─── Enums ─── */

export enum PlatformType {
  WEB = 'web'
}

/* ─── Able Time ─── */

export interface AbleTime {
  title: string
  predictBeginTime: string
  predictEndTime: string
}

export interface MonthlyAbleDate {
  startDate: string
  endDate: string
  usingDayCount: number
  partiallyDayCount: number
  partiallyDayPrice: number
  maxCount: number
  soldCount: number
  isSoldOut: boolean
  unitPrice: number
  totalPrice: number
}

/* ─── Auth (결제 전 인증 단계) ─── */

export interface RequestAuthCodePayload {
  phone: string
}

export interface RequestAuthCodeResponse {
  authCodeSeq: number
}

export interface RequestVerifyCodePayload {
  authCodeSeq: number
  code: string
  phone: string
}

export interface RequestGuestLoginPayload {
  guestSeq: number
}

export interface RequestGuestLoginResponse {
  accessToken: string
  refreshToken: string
}

/* ─── Payment Payloads ─── */

export interface ParkinglotPaymentPayload {
  couponSeq: number
  point: number
  price: number
  totalPrice: number
  authCodeSeq: number
  platform: PlatformType.WEB
  carNum: string
  predictBeginTime: string
  predictEndTime: string
  predictExitBeginTime?: string
  predictExitEndTime?: string
}

export interface BillkeyPaymentPayload {
  carNum: string
  point: number
  price: number
  totalPrice: number
  couponSeq: number
  predictBeginTime: string
  predictEndTime: string
  billSeq: number
  couponUserId?: number
  couponPrice?: number
}

/* ─── Payment Response ─── */

export interface PaymentResponse {
  redirectUrl: string
  successUrl: string
}

export interface BillkeyPaymentResponse {
  paymentSeq: number
}
