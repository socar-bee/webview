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

export enum PinAssetImageKey {}

/* ─── Ticket Group Pins ─── */

export interface TicketGroupPinIcon {
  pinIconSeq: number
  pinIconUrl: string
  pinIconUrl2x: string
  width: number
  height: number
}

export interface TicketGroup {
  ticketGroupSeq: number
  title: string
}

export interface TicketGroupPin {
  ticketGroupPinSeq: number
  deepLink: string
  geohash: string
  latitude: number
  longitude: number
  pinIcon: TicketGroupPinIcon
  ticketGroup: TicketGroup
}

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
