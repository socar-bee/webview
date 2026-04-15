'use client'

import { MarkerType, type Pin } from '@/shared/types/map'

interface PoiIconProps {
  pin: Pin
  isOn?: boolean
}

const PinShadowIcon = () => (
  <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="6" cy="3" rx="6" ry="3" fill="black" fillOpacity="0.15" />
  </svg>
)

function PoiWrapper({ children }: { children: React.ReactNode }) {
  return <div className="relative h-full w-full">{children}</div>
}

function ParkingCircle({ isOn }: { isOn: boolean }) {
  return (
    <div
      className={`flex h-[28px] w-[28px] items-center justify-center rounded-full border-[2px] shadow-[0_1px_3px_rgba(0,0,0,0.25)] ${
        isOn ? 'border-[#163D56] bg-[#224D6A]' : 'border-[#0088E6] bg-[#0099FF]'
      }`}
    >
      <span className="text-[13px] leading-none font-bold text-white">P</span>
    </div>
  )
}

// ── PRIVATE/PUBLIC - 흰 배경 + primary border + 중앙 'P' ──
function NormalPublicPOI({ label, isOn }: { label: string; isOn: boolean }) {
  return (
    <PoiWrapper>
      <div className="flex flex-col items-center">
        <div
          className={`flex h-[28px] w-[28px] items-center justify-center rounded-full border-[2px] shadow-[0_1px_3px_rgba(0,0,0,0.25)] ${
            isOn ? 'border-[#163D56] bg-[#224D6A]' : 'border-primary bg-white'
          }`}
        >
          <span className={`text-[13px] leading-none font-bold ${isOn ? 'text-white' : 'text-primary'}`}>P</span>
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
function NormalPartnerPOI({ label, isOn }: { label: string; isOn: boolean }) {
  return (
    <PoiWrapper>
      <div className="flex flex-col items-center">
        <ParkingCircle isOn={isOn} />
        {label && (
          <div
            className={`mt-[2px] rounded-[10px] px-[6px] py-[1px] text-center text-[11px] leading-[15px] font-bold whitespace-nowrap text-white ${
              isOn ? 'bg-[#163D56]' : 'bg-primary'
            }`}
          >
            {label}
          </div>
        )}
      </div>
    </PoiWrapper>
  )
}

// ── SHARE - 흰 배경 + primary border + 중앙 'S' ──
function NormalSharePOI({ label, isOn }: { label: string; isOn: boolean }) {
  return (
    <PoiWrapper>
      <div className="flex flex-col items-center">
        <div
          className={`flex h-[28px] w-[28px] items-center justify-center rounded-full border-[2px] shadow-[0_1px_3px_rgba(0,0,0,0.25)] ${
            isOn ? 'border-[#163D56] bg-[#224D6A]' : 'border-primary bg-white'
          }`}
        >
          <span className={`text-[13px] leading-none font-bold ${isOn ? 'text-white' : 'text-primary'}`}>S</span>
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
function PrimaryTicketPOI({ name, price, isOn }: { name: string; price: string; isOn: boolean }) {
  return (
    <PoiWrapper>
      <div className="relative z-[13] flex flex-col items-center">
        <div
          className={`relative overflow-hidden rounded-[8px] border-[1.5px] shadow-[0_2px_6px_rgba(0,0,0,0.2)] ${
            isOn ? 'border-[#163D56] bg-[#224D6A]' : 'border-[#0088E6] bg-[#0099FF]'
          }`}
        >
          <div className="flex min-w-[72px] flex-col items-center px-[10px] pt-[5px] pb-[6px]">
            <div className="text-[10px] leading-[14px] font-medium whitespace-nowrap text-white/80">{name}</div>
            <div className="mt-[1px] text-[15px] leading-[18px] font-bold text-white">{price}</div>
          </div>
        </div>
        <div
          className={`h-0 w-0 border-t-[5px] border-r-[5px] border-l-[5px] border-r-transparent border-l-transparent ${
            isOn ? 'border-t-[#224D6A]' : 'border-t-[#0099FF]'
          }`}
        />
        <div className="absolute right-1/2 -bottom-[12px] h-[6px] w-[12px] translate-x-1/2">
          <PinShadowIcon />
        </div>
      </div>
    </PoiWrapper>
  )
}

// ── PrimaryTicket (!canBuy) - gray card with ticket name + price ──
function PrimaryTicketDisabledPOI({ name, price, isOn }: { name: string; price: string; isOn: boolean }) {
  return (
    <PoiWrapper>
      <div className="relative z-[11] flex flex-col items-center">
        <div
          className={`relative overflow-hidden rounded-[8px] border-[1.5px] shadow-[0_2px_4px_rgba(0,0,0,0.12)] ${
            isOn ? 'border-[#163D56] bg-[#224D6A]' : 'border-[#8D9DAD] bg-[#B8C3D0]'
          }`}
        >
          <div className="flex min-w-[72px] flex-col items-center px-[10px] pt-[5px] pb-[6px]">
            <div className="text-[10px] leading-[14px] font-medium whitespace-nowrap text-white/70">{name}</div>
            <div className="mt-[1px] text-[15px] leading-[18px] font-bold text-white/90">{price}</div>
          </div>
        </div>
        <div
          className={`h-0 w-0 border-t-[5px] border-r-[5px] border-l-[5px] border-r-transparent border-l-transparent ${
            isOn ? 'border-t-[#224D6A]' : 'border-t-[#B8C3D0]'
          }`}
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

export default function PoiIcon({ pin, isOn = false }: PoiIconProps) {
  const label = normalizeLabel(pin.label)
  switch (pin.markerType) {
    case MarkerType.PrimaryTicket:
      return <PrimaryTicketPOI name={pin.ticketName ?? ''} price={formatPrice(pin.ticketPrice)} isOn={isOn} />
    case MarkerType.PrimaryTicketDisabled:
      return <PrimaryTicketDisabledPOI name={pin.ticketName ?? ''} price={formatPrice(pin.ticketPrice)} isOn={isOn} />
    case MarkerType.NormalPartner:
      return <NormalPartnerPOI label={label} isOn={isOn} />
    case MarkerType.NormalShare:
      return <NormalSharePOI label={label} isOn={isOn} />
    case MarkerType.NormalPublic:
    default:
      return <NormalPublicPOI label={label} isOn={isOn} />
  }
}
