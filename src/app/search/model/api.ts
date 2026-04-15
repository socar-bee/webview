import apiClient from '@/shared/lib/apiClient'

import type { SearchPlace } from './types'

export async function fetchSearchPlace(query: string): Promise<SearchPlace[]> {
  const { data } = await apiClient.get<{ data: { places: SearchPlace[] } }>(
    `/poi/search/place?q=${encodeURIComponent(query)}&type=naver`
  )
  return data.data.places
}
