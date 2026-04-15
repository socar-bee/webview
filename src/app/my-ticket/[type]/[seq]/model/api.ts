import apiClient from '@/shared/lib/apiClient'

import type { MyTicketDetail } from '@/shared/types/ticket'

export async function fetchMyTicketDetail(
  type: string,
  seq: string | number,
  token: string,
  guestCode?: string
): Promise<MyTicketDetail> {
  const { data } = await apiClient.get<{ data: MyTicketDetail }>(`/ticket/my-ticket/${type}/${seq}`, {
    params: guestCode ? { guestCode } : undefined,
    headers: { Authorization: `Bearer ${token}` }
  })
  return data.data
}

export async function useMyTicket(
  payload: { couSeq: number; guestCode: string },
  token: string
): Promise<{ couSeq: string }> {
  const { data } = await apiClient.post<{ data: { couSeq: string } }>('/ticket/my-ticket/use', payload, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data.data
}

export async function cancelPayment(
  seq: string | number,
  payload: { guestCode: string },
  token: string
): Promise<{ canceledDate: string; success: boolean }> {
  const { data } = await apiClient.post<{ data: { canceledDate: string; success: boolean } }>(
    `/ticket/payment/${seq}/cancel`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return data.data
}
