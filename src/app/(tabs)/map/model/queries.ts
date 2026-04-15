import { useQuery } from '@tanstack/react-query'

import type { Bounds, TicketGroupPin, TimeFilterDefaults, TimeFilterOptions } from './types'

import type { PinsGroupV2 } from '@/shared/types/map'

import { fetchPinsV2, fetchPoiMeta, fetchTicketGroupPins, fetchTimeFilterOptions } from './api'

export const mapQueryKeys = {
  all: ['map'] as const,
  timeFilterOptions: () => [...mapQueryKeys.all, 'timeFilterOptions'] as const,
  pins: (params: { geohashes: string; bounds: Bounds; timeFilter: TimeFilterDefaults }) =>
    [...mapQueryKeys.all, 'pins', params] as const
}

export function useTimeFilterOptions() {
  return useQuery<TimeFilterOptions>({
    queryKey: mapQueryKeys.timeFilterOptions(),
    queryFn: fetchTimeFilterOptions,
    staleTime: Infinity
  })
}

interface UsePinsParams {
  geohashes: string
  bounds: Bounds
  timeFilter: TimeFilterDefaults
}

export interface PinsQueryResult {
  pinsGroups: PinsGroupV2[]
  ticketGroupPins: TicketGroupPin[]
}

export function usePins(params: UsePinsParams | null) {
  return useQuery<PinsQueryResult>({
    queryKey: params ? mapQueryKeys.pins(params) : [...mapQueryKeys.all, 'pins', null],
    queryFn: async () => {
      if (!params) return { pinsGroups: [], ticketGroupPins: [] }
      const meta = await fetchPoiMeta(params.bounds)

      const [pinsGroups, ticketGroupPins] = await Promise.all([
        meta.isPinExist ? fetchPinsV2(params.geohashes, params.timeFilter) : Promise.resolve([] as PinsGroupV2[]),
        meta.isTicketGroupPinExist ? fetchTicketGroupPins(params.geohashes) : Promise.resolve([] as TicketGroupPin[])
      ])

      return { pinsGroups, ticketGroupPins }
    },
    staleTime: 60_000,
    enabled: !!params
  })
}
