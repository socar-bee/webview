import axios from 'axios'

import { SEO_BLOCK_PARKINGLOT_SEQ_LIST } from '@/shared/lib/seo'

import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

async function getParkinglotSeqs(): Promise<number[]> {
  const { data } = await axios.get<{ data: { parkinglotSeqs: number[] } }>('/poi/sitemap')
  return data.data.parkinglotSeqs
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.APP_ENV !== 'prod') return []

  try {
    const seqs = await getParkinglotSeqs()
    const host = process.env.NEXT_PUBLIC_WEBAPP_HOST || 'https://app.modu.kr'

    return seqs.flatMap((seq) => {
      if (SEO_BLOCK_PARKINGLOT_SEQ_LIST.includes(seq)) return []
      return [{ url: `${host}/p/${seq}`, lastModified: new Date(), changeFrequency: 'daily' as const }]
    })
  } catch {
    return []
  }
}
