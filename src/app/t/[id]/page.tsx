import { notFound } from 'next/navigation'
import { cache } from 'react'

import { resolveParkingDate } from '@/shared/lib/date'

import type { Metadata } from 'next'

import { fetchParkingLotDetail, fetchTicketList } from '@/app/p/[id]/model/api'

import { fetchTicketDetail } from './model/api'
import TicketDetailView from './view'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ parkingDate?: string; durationId?: string }>
}

export const revalidate = 0

const getTicketDetail = cache(fetchTicketDetail)
const getParkingLotDetail = cache(fetchParkingLotDetail)
const getTicketList = cache(fetchTicketList)

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params
  const sp = (await searchParams) ?? {}
  const parkingDate = resolveParkingDate(sp.parkingDate)

  try {
    const ticket = await getTicketDetail(id, parkingDate)
    if (!ticket) return notFound()
    const pin = await getParkingLotDetail(ticket.parkinglot.parkinglotSeq, 'P' as never)
    if (!pin) return notFound()
    const parkinglotName = pin.basic.name.endsWith('주차장') ? pin.basic.name : `${pin.basic.name} 주차장`
    const ticketDesc = `${ticket.couponName}: ${ticket.price.toLocaleString()}원`
    const desc = `${parkinglotName} ${ticketDesc} 판매중. 주소: ${pin.basic.newAddress || pin.basic.address}`

    return {
      title: `${parkinglotName} - ${ticket.couponName}`,
      description: desc,
      openGraph: {
        title: parkinglotName,
        description: desc,
        siteName: '모두의주차장',
        locale: 'ko_KR',
        images: pin.basic.photos[0]?.file_name
      }
    }
  } catch {
    return { title: '주차권 상세 - 모두의주차장' }
  }
}

export default async function TicketDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const sp = (await searchParams) ?? {}
  const parkingDate = resolveParkingDate(sp.parkingDate)

  let ticket
  let pin
  let tickets
  try {
    ticket = await getTicketDetail(id, parkingDate)
    const parkinglotSeq = ticket.parkinglot.parkinglotSeq
    ;[pin, tickets] = await Promise.all([
      getParkingLotDetail(parkinglotSeq, 'P' as never),
      getTicketList(parkinglotSeq, parkingDate, sp.durationId)
    ])
  } catch {
    return notFound()
  }

  return <TicketDetailView couponSeq={Number(id)} initialTicket={ticket} parkingTickets={tickets} pin={pin} />
}
