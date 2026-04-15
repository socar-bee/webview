/* ─── Pin V2 Types (server-driven UI) ─── */

export enum PinV2Type {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  PARTNER = 'PARTNER',
  SHARE = 'SHARE',
  EV = 'EV'
}

export enum PinV2Style {
  DEFAULT = 'DEFAULT',
  DISABLED = 'DISABLED',
  ACCENT = 'ACCENT',
  MUTED = 'MUTED',
  IMAGE = 'IMAGE'
}

export interface PinV2ParkingLot {
  seq: number
  name: string
  latitude: number
  longitude: number
}

export interface PinV2PrimaryTicket {
  name: string
  price: number
  canBuy: boolean
}

export interface PinV2Pin {
  type: PinV2Type
  parkingLot: PinV2ParkingLot
  label: string
  style: PinV2Style
  badges: string[]
  tickets: PinV2PrimaryTicket[]
  primaryTicket: PinV2PrimaryTicket | null
}

export interface PinsGroupV2 {
  geohash: string
  pins: PinV2Pin[]
}

/* ─── Marker Types ─── */

export enum MarkerType {
  PrimaryTicket = 'PrimaryTicket',
  PrimaryTicketDisabled = 'PrimaryTicketDisabled',
  NormalPublic = 'NormalPublic',
  NormalPartner = 'NormalPartner',
  NormalShare = 'NormalShare'
}

/* ─── Pin Model ─── */

export interface Pin {
  seq: number
  lat: number
  lng: number
  geohash: string
  markerType: MarkerType
  pinType: PinV2Type
  label: string
  ticketName?: string
  ticketPrice?: number
  isPartner: boolean
  hasActivePrimaryTicket: boolean
  zIndex: number
}

/* ─── Factory ─── */

function resolveMarkerType(pin: PinV2Pin): MarkerType {
  if (pin.primaryTicket) {
    return pin.primaryTicket.canBuy ? MarkerType.PrimaryTicket : MarkerType.PrimaryTicketDisabled
  }
  if (pin.type === PinV2Type.PARTNER) return MarkerType.NormalPartner
  if (pin.type === PinV2Type.SHARE) return MarkerType.NormalShare
  return MarkerType.NormalPublic
}

function getZIndex(type: MarkerType): number {
  switch (type) {
    case MarkerType.NormalPublic:
      return 50
    case MarkerType.NormalPartner:
      return 60
    case MarkerType.NormalShare:
      return 70
    case MarkerType.PrimaryTicketDisabled:
      return 80
    case MarkerType.PrimaryTicket:
      return 90
    default:
      return 50
  }
}

export function createPinFromV2(pin: PinV2Pin, geohash: string): Pin {
  const markerType = resolveMarkerType(pin)
  const hasActivePrimaryTicket = pin.primaryTicket != null && pin.primaryTicket.canBuy

  return {
    seq: pin.parkingLot.seq,
    lat: pin.parkingLot.latitude,
    lng: pin.parkingLot.longitude,
    geohash,
    markerType,
    pinType: pin.type,
    label: pin.label,
    ticketName: pin.primaryTicket?.name,
    ticketPrice: pin.primaryTicket?.price,
    isPartner: pin.type === PinV2Type.PARTNER,
    hasActivePrimaryTicket,
    zIndex: getZIndex(markerType)
  }
}
