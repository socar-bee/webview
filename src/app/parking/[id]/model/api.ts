import axios from 'axios'

import type { ParkingLotDetail, ParkingLotType, TicketDetail, TicketListItem } from '@/shared/types/parking'

export async function fetchParkingLotDetail(
  seq: string | number,
  type: ParkingLotType = 'P' as ParkingLotType
): Promise<ParkingLotDetail> {
  const { data } = await axios.get<{ data: ParkingLotDetail }>(`/poi/pins/${type}/${seq}`)
  return data.data
}

export async function fetchTicketList(
  parkinglotSeq: string | number,
  parkingDate: string,
  durationId?: string
): Promise<TicketListItem[]> {
  const { data } = await axios.get<{ data: { tickets: TicketListItem[] } }>('/ticket/list', {
    params: {
      parkinglotSeq,
      parkingDate,
      ...(durationId ? { durationId } : {})
    }
  })
  return data.data.tickets
}

export async function fetchTicketDetail(couponSeq: string | number, parkingDate: string): Promise<TicketDetail> {
  const { data } = await axios.get<{ data: TicketDetail }>(`/ticket/${couponSeq}`, {
    params: { parkingDate }
  })
  return data.data
}
