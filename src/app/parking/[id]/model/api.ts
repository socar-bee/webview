import apiClient from '@/shared/lib/apiClient'

import type { ParkingLotDetail, ParkingLotType, TicketDetail, TicketListItem } from '@/shared/types/parking'

import { advanceApiClient } from '@/app/(tabs)/map/model/api'

export async function fetchParkingLotDetail(
  seq: string | number,
  type: ParkingLotType = 'P' as ParkingLotType
): Promise<ParkingLotDetail> {
  const { data } = await advanceApiClient.get<{ data: ParkingLotDetail }>(`/poi/pins/${type}/${seq}`)
  return data.data
}

export async function fetchTicketList(parkinglotSeq: string | number): Promise<TicketListItem[]> {
  const { data } = await apiClient.get<{ data: { tickets: TicketListItem[] } }>('/ticket/list', {
    params: { parkinglotSeq }
  })
  return data.data.tickets
}

export async function fetchTicketDetail(couponSeq: string | number): Promise<TicketDetail> {
  const { data } = await apiClient.get<{ data: TicketDetail }>(`/ticket/${couponSeq}`)
  return data.data
}
