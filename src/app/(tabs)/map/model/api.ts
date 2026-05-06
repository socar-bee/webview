import axios from 'axios'

import type {
  Bounds,
  PinAssetKey,
  PinAssetsData,
  PoiMeta,
  TicketGroupPin,
  TimeFilterDefaults,
  TimeFilterOptions
} from './types'

import type { PinsGroupV2 } from '@/shared/types/map'

export async function fetchTimeFilterOptions(): Promise<TimeFilterOptions> {
  const { data } = await axios.get<{ data: TimeFilterOptions }>('/ticket/time-filter-options')
  return data.data
}

export async function fetchPoiMeta(bounds: Bounds): Promise<PoiMeta> {
  const { data } = await axios.get<{ data: PoiMeta }>('/poi/meta', {
    params: {
      swLat: bounds.sw.lat,
      swLng: bounds.sw.lng,
      neLat: bounds.ne.lat,
      neLng: bounds.ne.lng
    }
  })
  return data.data
}

export async function fetchPinAssets(): Promise<PinAssetsData> {
  const { data } = await axios.get<{ data: PinAssetsData }>('/poi/pin-assets')
  return data.data
}

export async function fetchPinsV2(geohashes: string, timeFilter: TimeFilterDefaults): Promise<PinsGroupV2[]> {
  const { data } = await axios.get<{ data: PinsGroupV2[] }>('/poi/pins', {
    params: {
      geohash: geohashes,
      durationId: timeFilter.durationId,
      parkingDate: timeFilter.date
    },
    headers: { 'modu-api-version': '2' }
  })
  return data.data
}

export async function fetchTicketGroupPins(geohashes: string): Promise<TicketGroupPin[]> {
  const { data } = await axios.get<{ data: { ticketGroupPins: TicketGroupPin[] } }>('/poi/pins/ticket-group', {
    params: { geohash: geohashes }
  })
  return data.data.ticketGroupPins ?? []
}

export function getAssetIconUrl(assets: PinAssetsData | null, key: PinAssetKey): string | undefined {
  if (!assets) return undefined
  return assets.icons.find((i) => i.key === key)?.iconUrl
}
