import { notFound } from 'next/navigation'
import { cache } from 'react'

import LdJson from '@/shared/components/scripts/LdJson'

import { resolveParkingDate } from '@/shared/lib/date'
import { META_KEYWORDS, SEO_BLOCK_PARKINGLOT_SEQ_LIST, removeOperatorPrefix } from '@/shared/lib/seo'

import type { Metadata } from 'next'

import { fetchParkingLotDetail, fetchTicketList } from '@/app/parking/[id]/model/api'

import PartnerDetailView from './view'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ parkingDate?: string; durationId?: string }>
}

export const revalidate = 600

const getParkingDetail = cache(fetchParkingLotDetail)
const getTicketList = cache(fetchTicketList)

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params
  const sp = (await searchParams) ?? {}

  try {
    const detail = await getParkingDetail(id, 'P' as never)
    if (!detail) return notFound()

    const parkingDate = resolveParkingDate(sp.parkingDate)
    const tickets = await getTicketList(id, parkingDate, sp.durationId)
    const ticketsJoin = tickets.map((t) => `${t.couponName}: ${t.price}원`).join(',')
    const ticketDesc = ticketsJoin ? `${ticketsJoin}을 판매합니다.` : ''

    const address = detail.basic.newAddress || detail.basic.address
    const title = removeOperatorPrefix(detail.basic.name)

    const desc = detail.aiDescription
      ? detail.aiDescription.response
      : `${title}은 ${address}에 위치합니다. ${ticketDesc}`

    const ogImage =
      detail.basic.photos[0]?.file_name ??
      `${process.env.NEXT_PUBLIC_WEBAPP_HOST || 'https://app.modu.kr'}/images/light_img_linkbanner.png`

    const metadata: Metadata = {
      title,
      description: desc,
      keywords: META_KEYWORDS.PARKINGLOT_DETAIL,
      openGraph: {
        title,
        description: desc,
        siteName: '모두의주차장',
        locale: 'ko_KR',
        images: ogImage
      }
    }

    if (SEO_BLOCK_PARKINGLOT_SEQ_LIST.includes(Number(id))) {
      metadata.robots = { index: false, follow: false }
    }

    return metadata
  } catch {
    return notFound()
  }
}

export default async function PartnerParkingPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const seq = Number(id)

  let initialDetail = undefined
  try {
    initialDetail = await getParkingDetail(id, 'P' as never)
  } catch {
    return notFound()
  }

  const meta = await generateMetadata({ params, searchParams })
  const jsonTitle = String(meta.title ?? '모두의주차장 - 주변 주차장 찾기')
  const jsonDesc =
    typeof meta.description === 'string'
      ? meta.description
      : '지도 화면에서 근처의 주차장 위치와 가격을 한 눈에 확인하세요. 편리하게 주차장을 예약하고, 주차 정보를 공유하세요.'

  return (
    <>
      <LdJson title={jsonTitle} desc={jsonDesc} keywords={META_KEYWORDS.PARKINGLOT_DETAIL} />
      <PartnerDetailView seq={seq} initialDetail={initialDetail} />
    </>
  )
}
