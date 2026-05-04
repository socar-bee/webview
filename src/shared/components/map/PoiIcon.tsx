'use client'

import { MarkerType, type Pin } from '@/shared/types/map'

interface PoiIconProps {
  pin: Pin
  isOn?: boolean
  isFavorite?: boolean
}

const PinShadowIcon = () => (
  <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="6" cy="3" rx="6" ry="3" fill="black" fillOpacity="0.15" />
  </svg>
)

function PoiWrapper({ children }: { children: React.ReactNode }) {
  return <div className="relative h-full w-full">{children}</div>
}

/**
 * 마커 색상 팔레트 — 우선순위: isOn(선택) > isFavorite(즐겨찾기) > 기본
 * - solid: 배경 채움 마커(이름표 라벨, P 원형, 주차권 카드)에 사용
 * - light: 옅은 배경 + 테두리 마커(공영 P)에 사용
 */
function getMarkerPalette(isOn: boolean, isFavorite: boolean) {
  if (isOn) {
    return {
      solidBg: '#224D6A',
      solidBorder: '#163D56',
      lightBg: '#224D6A',
      lightBorder: '#163D56',
      lightText: '#FFFFFF',
      labelBg: '#163D56',
      labelText: '#FFFFFF'
    }
  }
  if (isFavorite) {
    return {
      solidBg: '#FF3B5C',
      solidBorder: '#E0233F',
      lightBg: '#FFE3E8',
      lightBorder: '#FF3B5C',
      lightText: '#B81E33',
      labelBg: '#FF3B5C',
      labelText: '#FFFFFF'
    }
  }
  return null // 기본 클래스 그대로 사용
}

function ParkingCircle({ isOn, isFavorite }: { isOn: boolean; isFavorite: boolean }) {
  const palette = getMarkerPalette(isOn, isFavorite)
  return (
    <div
      className={`flex h-[28px] w-[28px] items-center justify-center rounded-full border-[2px] shadow-[0_1px_3px_rgba(0,0,0,0.25)] ${
        palette ? '' : 'border-[#0088E6] bg-[#0099FF]'
      }`}
      style={palette ? { borderColor: palette.solidBorder, backgroundColor: palette.solidBg } : undefined}
    >
      <span className="text-[13px] leading-none font-bold text-white">P</span>
    </div>
  )
}

// ── PRIVATE/PUBLIC - light primary 배경 + primary border + 중앙 'P' ──
function NormalPublicPOI({ label, isOn, isFavorite }: { label: string; isOn: boolean; isFavorite: boolean }) {
  const palette = getMarkerPalette(isOn, isFavorite)
  return (
    <PoiWrapper>
      <div className="flex flex-col items-center">
        <div
          className={`flex h-[28px] w-[28px] items-center justify-center rounded-full border-[2px] shadow-[0_1px_3px_rgba(0,0,0,0.25)] ${
            palette ? '' : 'border-primary bg-primary-light'
          }`}
          style={palette ? { borderColor: palette.lightBorder, backgroundColor: palette.lightBg } : undefined}
        >
          <span
            className={`text-[13px] leading-none font-bold ${palette ? '' : 'text-primary-dark'}`}
            style={palette ? { color: palette.lightText } : undefined}
          >
            P
          </span>
        </div>
        {label && (
          <div
            className={`mt-[2px] rounded-[10px] px-[5px] py-[1px] text-center text-[11px] leading-[15px] font-bold whitespace-nowrap ${
              isOn ? 'bg-[#224D6A] text-white' : 'bg-white text-[#263238]'
            }`}
            style={{ textShadow: isOn ? 'none' : '0 0 3px rgba(255,255,255,0.8)' }}
          >
            {label}
          </div>
        )}
      </div>
    </PoiWrapper>
  )
}

// ── PARTNER (no primaryTicket) - primary label badge below circle ──
function NormalPartnerPOI({ label, isOn, isFavorite }: { label: string; isOn: boolean; isFavorite: boolean }) {
  const palette = getMarkerPalette(isOn, isFavorite)
  return (
    <PoiWrapper>
      <div className="flex flex-col items-center">
        <ParkingCircle isOn={isOn} isFavorite={isFavorite} />
        {label && (
          <div
            className={`mt-[2px] rounded-[10px] px-[6px] py-[1px] text-center text-[11px] leading-[15px] font-bold whitespace-nowrap text-white ${
              palette ? '' : 'bg-primary'
            }`}
            style={palette ? { backgroundColor: palette.labelBg, color: palette.labelText } : undefined}
          >
            {label}
          </div>
        )}
      </div>
    </PoiWrapper>
  )
}

// ── SHARE - 흰 배경 + primary border + 중앙 'S' ──
function NormalSharePOI({ label, isOn, isFavorite }: { label: string; isOn: boolean; isFavorite: boolean }) {
  const palette = getMarkerPalette(isOn, isFavorite)
  // share는 흰 배경 + 컬러 보더 + 컬러 'S' (선택 시만 채워진 어두운 배경 + 흰 'S')
  const isFilled = isOn
  return (
    <PoiWrapper>
      <div className="flex flex-col items-center">
        <div
          className={`flex h-[28px] w-[28px] items-center justify-center rounded-full border-[2px] shadow-[0_1px_3px_rgba(0,0,0,0.25)] ${
            isFilled ? 'border-[#163D56] bg-[#224D6A]' : palette ? 'bg-white' : 'border-primary bg-white'
          }`}
          style={!isFilled && palette ? { borderColor: palette.solidBorder } : undefined}
        >
          <span
            className={`text-[13px] leading-none font-bold ${isFilled ? 'text-white' : palette ? '' : 'text-primary'}`}
            style={!isFilled && palette ? { color: palette.solidBg } : undefined}
          >
            S
          </span>
        </div>
        {label && (
          <div
            className={`mt-[2px] rounded-[10px] px-[5px] py-[1px] text-center text-[11px] leading-[15px] font-bold whitespace-nowrap ${
              isOn ? 'bg-[#224D6A] text-white' : 'bg-white text-[#263238]'
            }`}
            style={{ textShadow: isOn ? 'none' : '0 0 3px rgba(255,255,255,0.8)' }}
          >
            {label}
          </div>
        )}
      </div>
    </PoiWrapper>
  )
}

// ── PrimaryTicket (canBuy) - primary card with ticket name + price ──
function PrimaryTicketPOI({
  name,
  price,
  isOn,
  isFavorite
}: {
  name: string
  price: string
  isOn: boolean
  isFavorite: boolean
}) {
  const palette = getMarkerPalette(isOn, isFavorite)
  return (
    <PoiWrapper>
      <div className="relative z-[13] flex flex-col items-center">
        <div
          className={`rounded-[8px] border-[1.5px] shadow-[0_2px_6px_rgba(0,0,0,0.2)] ${
            palette ? '' : 'border-[#0088E6] bg-[#0099FF]'
          }`}
          style={palette ? { borderColor: palette.solidBorder, backgroundColor: palette.solidBg } : undefined}
        >
          <div className="flex min-w-[72px] flex-col items-center px-[10px] pt-[5px] pb-[6px]">
            <div className="text-[10px] leading-[14px] font-medium whitespace-nowrap text-white/80">{name}</div>
            <div className="mt-[1px] text-[15px] leading-[18px] font-bold text-white">{price}</div>
          </div>
        </div>
        <div
          className={`h-0 w-0 border-t-[5px] border-r-[5px] border-l-[5px] border-r-transparent border-l-transparent ${
            palette ? '' : 'border-t-[#0099FF]'
          }`}
          style={palette ? { borderTopColor: palette.solidBg } : undefined}
        />
        <div className="absolute right-1/2 -bottom-[12px] h-[6px] w-[12px] translate-x-1/2">
          <PinShadowIcon />
        </div>
      </div>
    </PoiWrapper>
  )
}

// ── PrimaryTicket (!canBuy) - gray card with ticket name + price ──
function PrimaryTicketDisabledPOI({
  name,
  price,
  isOn,
  isFavorite
}: {
  name: string
  price: string
  isOn: boolean
  isFavorite: boolean
}) {
  const palette = getMarkerPalette(isOn, isFavorite)
  return (
    <PoiWrapper>
      <div className="relative z-[11] flex flex-col items-center">
        <div
          className={`rounded-[8px] border-[1.5px] shadow-[0_2px_4px_rgba(0,0,0,0.12)] ${
            palette ? '' : 'border-[#8D9DAD] bg-[#B8C3D0]'
          }`}
          style={palette ? { borderColor: palette.solidBorder, backgroundColor: palette.solidBg } : undefined}
        >
          <div className="flex min-w-[72px] flex-col items-center px-[10px] pt-[5px] pb-[6px]">
            <div className="text-[10px] leading-[14px] font-medium whitespace-nowrap text-white/70">{name}</div>
            <div className="mt-[1px] text-[15px] leading-[18px] font-bold text-white/90">{price}</div>
          </div>
        </div>
        <div
          className={`h-0 w-0 border-t-[5px] border-r-[5px] border-l-[5px] border-r-transparent border-l-transparent ${
            palette ? '' : 'border-t-[#B8C3D0]'
          }`}
          style={palette ? { borderTopColor: palette.solidBg } : undefined}
        />
        <div className="absolute right-1/2 -bottom-[12px] h-[6px] w-[12px] translate-x-1/2">
          <PinShadowIcon />
        </div>
      </div>
    </PoiWrapper>
  )
}

function formatPrice(price: number | undefined): string {
  return price?.toLocaleString() ?? ''
}

function normalizeLabel(label: string): string {
  const trimmed = label?.trim() ?? ''
  if (!trimmed || trimmed.toUpperCase() === 'P') return ''
  return trimmed
}

export default function PoiIcon({ pin, isOn = false, isFavorite = false }: PoiIconProps) {
  const label = normalizeLabel(pin.label)
  switch (pin.markerType) {
    case MarkerType.PrimaryTicket:
      return (
        <PrimaryTicketPOI
          name={pin.ticketName ?? ''}
          price={formatPrice(pin.ticketPrice)}
          isOn={isOn}
          isFavorite={isFavorite}
        />
      )
    case MarkerType.PrimaryTicketDisabled:
      return (
        <PrimaryTicketDisabledPOI
          name={pin.ticketName ?? ''}
          price={formatPrice(pin.ticketPrice)}
          isOn={isOn}
          isFavorite={isFavorite}
        />
      )
    case MarkerType.NormalPartner:
      return <NormalPartnerPOI label={label} isOn={isOn} isFavorite={isFavorite} />
    case MarkerType.NormalShare:
      return <NormalSharePOI label={label} isOn={isOn} isFavorite={isFavorite} />
    case MarkerType.NormalPublic:
    default:
      return <NormalPublicPOI label={label} isOn={isOn} isFavorite={isFavorite} />
  }
}
