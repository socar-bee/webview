import axios from 'axios'

import type { PinsGroupV2 } from '@/shared/types/map'

const advanceApi = axios.create({
  baseURL: 'https://moduapi-dev-preview-advance-purchase.socar.me'
})

/* ─── Types ─── */

export interface TimeFilterDefaults {
  date: string
  durationId: string
}

export interface TimeFilterOptions {
  dates: string[]
  defaults: TimeFilterDefaults
  durations: { id: string; label: string }[]
}

export interface Bounds {
  sw: { lat: number; lng: number }
  ne: { lat: number; lng: number }
}

export interface PoiMeta {
  isPinExist: boolean
  isTicketGroupPinExist: boolean
}

export enum PinAssetKey {
  NONE = 'NONE',
  FACILITY_CAFE = 'FACILITY_CAFE',
  FACILITY_RESTAURANT = 'FACILITY_RESTAURANT',
  FACILITY_MART = 'FACILITY_MART',
  FACILITY_EV = 'FACILITY_EV',
  RT_FULL = 'RT_FULL',
  RT_BUSY = 'RT_BUSY',
  RT_AFFORD = 'RT_AFFORD',
  PARTNER_FILLED = 'PARTNER_FILLED',
  PARTNER_OUTLINED = 'PARTNER_OUTLINED',
  SHARE_RT_FULL = 'SHARE_RT_FULL',
  SHARE_RT_BUSY = 'SHARE_RT_BUSY',
  SHARE_RT_AFFORD = 'SHARE_RT_AFFORD',
  SHARE_OUTLINED = 'SHARE_OUTLINED'
}

// NOTE: 서버 응답에 따라 값 추가 예정
export enum PinAssetImageKey {}

export interface PinAssetIcon {
  key: PinAssetKey
  iconUrl: string
}

export interface PinAssetImage {
  key: PinAssetImageKey
  defaultImageUrl: string
  clickedImageUrl: string
  width: number
  height: number
}

export interface PinAssetsData {
  version: string
  icons: PinAssetIcon[]
  images: PinAssetImage[]
}

/* ─── Time Filter ─── */

let cachedDefaults: TimeFilterDefaults | null = null

export async function fetchTimeFilterDefaults(): Promise<TimeFilterDefaults> {
  if (cachedDefaults) return cachedDefaults
  const { data } = await advanceApi.get<{ data: TimeFilterOptions }>('/ticket/time-filter-options')
  cachedDefaults = data.data.defaults
  return cachedDefaults
}

export async function fetchTimeFilterFullOptions(): Promise<TimeFilterOptions> {
  const { data } = await advanceApi.get<{ data: TimeFilterOptions }>('/ticket/time-filter-options')
  return data.data
}

/* ─── POI Meta ─── */

export async function fetchPoiMeta(bounds: Bounds): Promise<PoiMeta> {
  const { data } = await advanceApi.get<{ data: PoiMeta }>('/poi/meta', {
    params: {
      swLat: bounds.sw.lat,
      swLng: bounds.sw.lng,
      neLat: bounds.ne.lat,
      neLng: bounds.ne.lng
    }
  })
  return data.data
}

/* ─── Pin Assets ─── */

export async function fetchPinAssets(): Promise<PinAssetsData> {
  const { data } = await advanceApi.get<{ data: PinAssetsData }>('/poi/pin-assets')
  return data.data
}

export function getAssetIconUrl(assets: PinAssetsData | null, key: PinAssetKey): string | undefined {
  if (!assets) return undefined
  return assets.icons.find((i) => i.key === key)?.iconUrl
}

/* ─── Pins V2 ─── */

export async function fetchPinsV2(geohashes: string, timeFilter: TimeFilterDefaults): Promise<PinsGroupV2[]> {
  const { data } = await advanceApi.get<{ data: PinsGroupV2[] }>('/poi/pins', {
    params: {
      geohash: geohashes,
      durationId: timeFilter.durationId,
      parkingDate: timeFilter.date
    },
    headers: { 'modu-api-version': '2' }
  })
  return data.data
}
