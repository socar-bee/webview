import { format, parse } from 'date-fns'
import { ko } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'

const SEOUL_TZ = 'Asia/Seoul'

export function getTodayInSeoul(): string {
  return formatInTimeZone(new Date(), SEOUL_TZ, 'yyyy-MM-dd')
}

export function resolveParkingDate(parkingDate?: string | null): string {
  return parkingDate && parkingDate.length > 0 ? parkingDate : getTodayInSeoul()
}

/** "yyyy-MM-dd HH:mm:ss" → "yyyy.MM.dd(EEE)" (e.g. 2026.05.07(목)) */
export function formatModifyDate(dateString: string): string {
  try {
    const date = parse(dateString, 'yyyy-MM-dd HH:mm:ss', new Date())
    return format(date, 'yyyy.MM.dd(EEE)', { locale: ko })
  } catch {
    return dateString
  }
}
