import axios from 'axios'

import apiClient from '@/shared/lib/apiClient'

import type {
  AbleTime,
  BillkeyPaymentPayload,
  BillkeyPaymentResponse,
  MonthlyAbleDate,
  ParkinglotPaymentPayload,
  PaymentResponse,
  RequestAuthCodePayload,
  RequestAuthCodeResponse,
  RequestGuestLoginPayload,
  RequestGuestLoginResponse,
  RequestVerifyCodePayload
} from '@/shared/types/purchase'

export async function fetchDailyAbleTime(seq: string | number, parkingDate: string): Promise<AbleTime[]> {
  const { data } = await axios.get<{ data: { ableTimes: AbleTime[] } }>(`/ticket/${seq}/daily-able-time`, {
    params: { parkingDate }
  })
  return data.data.ableTimes
}

export async function fetchMonthlyAbleDate(seq: string | number): Promise<MonthlyAbleDate[]> {
  const { data } = await apiClient.get<{ data: { ableDates: MonthlyAbleDate[] } }>(`/ticket/${seq}/monthly-able-date`)
  return data.data.ableDates
}

export async function requestAuthCode(payload: RequestAuthCodePayload): Promise<RequestAuthCodeResponse> {
  const { data } = await apiClient.post<{ data: RequestAuthCodeResponse }>('/user/code/send', payload)
  return data.data
}

export async function requestVerifyCode(payload: RequestVerifyCodePayload): Promise<void> {
  await apiClient.post('/user/code/verify', payload)
}

export async function requestGuestLogin(payload: RequestGuestLoginPayload): Promise<RequestGuestLoginResponse> {
  const { data } = await apiClient.post<{ data: RequestGuestLoginResponse }>('/user/login/guest', payload)
  return data.data
}

export async function requestParkinglotPayment(
  pgType: string,
  payload: ParkinglotPaymentPayload,
  token: string
): Promise<PaymentResponse> {
  const { data } = await apiClient.post<{ data: PaymentResponse }>(`/ticket/payment/webview/${pgType}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data.data
}

export async function requestBillkeyPayment(
  payload: BillkeyPaymentPayload,
  token: string
): Promise<BillkeyPaymentResponse> {
  const { data } = await apiClient.post<{ data: BillkeyPaymentResponse }>('/ticket/payment/billkey', payload, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data.data
}
