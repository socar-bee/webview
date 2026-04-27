import { useQuery } from '@tanstack/react-query'

import { resolveParkingDate } from '@/shared/lib/date'

import type { ParkingLotDetail, ParkingLotType, TicketListItem } from '@/shared/types/parking'

import { fetchParkingLotDetail, fetchTicketList } from './api'

export const parkingQueryKeys = {
  all: ['parking'] as const,
  detail: (seq: number, type: string) => [...parkingQueryKeys.all, 'detail', seq, type] as const,
  tickets: (seq: number, parkingDate: string, durationId?: string) =>
    [...parkingQueryKeys.all, 'tickets', seq, parkingDate, durationId ?? null] as const
}

export function useParkingLotDetail(seq: number | null, type?: ParkingLotType, initialData?: ParkingLotDetail) {
  return useQuery<ParkingLotDetail>({
    queryKey: seq !== null ? parkingQueryKeys.detail(seq, type ?? 'P') : [...parkingQueryKeys.all, 'detail', null],
    queryFn: () => fetchParkingLotDetail(seq!, type),
    enabled: seq !== null,
    staleTime: 60_000,
    ...(initialData ? { initialData, initialDataUpdatedAt: () => Date.now() } : {})
  })
}

export function useTicketList(seq: number | null, parkingDate?: string, durationId?: string) {
  const resolvedDate = resolveParkingDate(parkingDate)
  return useQuery<TicketListItem[]>({
    queryKey:
      seq !== null
        ? parkingQueryKeys.tickets(seq, resolvedDate, durationId)
        : [...parkingQueryKeys.all, 'tickets', null],
    queryFn: () => fetchTicketList(seq!, resolvedDate, durationId),
    enabled: seq !== null,
    staleTime: 60_000
  })
}
