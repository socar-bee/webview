import { formatInTimeZone } from 'date-fns-tz'

const SEOUL_TZ = 'Asia/Seoul'

export function getTodayInSeoul(): string {
  return formatInTimeZone(new Date(), SEOUL_TZ, 'yyyy-MM-dd')
}

export function resolveParkingDate(parkingDate?: string | null): string {
  return parkingDate && parkingDate.length > 0 ? parkingDate : getTodayInSeoul()
}
