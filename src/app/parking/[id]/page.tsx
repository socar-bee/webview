import { cache } from 'react'

import type { Metadata } from 'next'

import { fetchParkingLotDetail } from './model/api'
import ParkingDetailView from './view'

interface PageProps {
  params: Promise<{ id: string }>
}

// React cache() deduplicates the fetch within a single request
const getParkingDetail = cache(fetchParkingLotDetail)

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const detail = await getParkingDetail(id)
    const name = detail.basic.name
    const address = detail.basic.newAddress || detail.basic.address
    return {
      title: `${name} - 모두의주차장`,
      description: `${name} 주차권 구매 및 주차장 정보. 주소: ${address}`,
      openGraph: {
        title: `${name} - 모두의주차장`,
        description: `주차권 구매 | ${address}`,
        type: 'website'
      }
    }
  } catch {
    return { title: '주차장 상세 - 모두의주차장' }
  }
}

export default async function ParkingDetailPage({ params }: PageProps) {
  const { id } = await params
  const seq = Number(id)

  let initialDetail = undefined
  try {
    initialDetail = await getParkingDetail(id)
  } catch {
    // Client will fetch on mount
  }

  return <ParkingDetailView seq={seq} initialDetail={initialDetail} />
}
