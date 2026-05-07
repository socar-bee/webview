import { useQuery } from '@tanstack/react-query'

import type { TicketDetail } from '@/shared/types/parking'

import { fetchTicketDetail, fetchUserInputTemplate } from './api'

export const ticketQueryKeys = {
  all: ['ticket'] as const,
  detail: (couponSeq: number | string, parkingDate: string) =>
    [...ticketQueryKeys.all, 'detail', String(couponSeq), parkingDate] as const,
  userInputTemplate: (couponSeq: number | string) =>
    [...ticketQueryKeys.all, 'userInputTemplate', String(couponSeq)] as const
}

export function useTicketDetail(couponSeq: number | string | null, parkingDate: string, initialData?: TicketDetail) {
  return useQuery<TicketDetail>({
    queryKey: ticketQueryKeys.detail(couponSeq ?? '', parkingDate),
    queryFn: () => fetchTicketDetail(couponSeq as number, parkingDate),
    enabled: couponSeq != null && parkingDate.length > 0,
    staleTime: 30_000,
    initialData
  })
}

export function useUserInputTemplate(couponSeq: number | string | null) {
  return useQuery<string | null>({
    queryKey: ticketQueryKeys.userInputTemplate(couponSeq ?? ''),
    queryFn: () => fetchUserInputTemplate(couponSeq as number),
    enabled: couponSeq != null,
    staleTime: Infinity
  })
}
