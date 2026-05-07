import apiClient from '@/shared/lib/apiClient'

import type { TicketDetail } from '@/shared/types/parking'

/**
 * 주차권 상세 조회
 * GET /ticket/{couponSeq}?parkingDate=YYYY-MM-DD
 */
export async function fetchTicketDetail(couponSeq: string | number, parkingDate: string): Promise<TicketDetail> {
  const { data } = await apiClient.get<{ data: TicketDetail }>(`/ticket/${couponSeq}`, {
    params: { parkingDate }
  })
  return data.data
}

/**
 * 주차권 이용자 정보 입력 템플릿
 * GET /ticket/{couponSeq}/user-input-template
 * 결제 시 사용자 추가 정보 수집용 (차량번호 등). 없으면 null.
 */
export async function fetchUserInputTemplate(couponSeq: string | number): Promise<string | null> {
  const { data } = await apiClient.get<{ data: { userInputTemplate: string | null } }>(
    `/ticket/${couponSeq}/user-input-template`
  )
  return data.data.userInputTemplate
}
