'use client'

import ngeohash from 'ngeohash'
import { useCallback, useEffect, useRef, useState } from 'react'
import ReactDOMServer from 'react-dom/server'

import CurrentPositionMarker from '@/shared/components/map/CurrentPositionMarker'
import ParkingCluster from '@/shared/components/map/ParkingCluster'
import PoiIcon from '@/shared/components/map/PoiIcon'
import ShareCluster from '@/shared/components/map/ShareCluster'
import type { TimeFilterOptions } from '@/shared/components/map/TimeFilterSheet'

import { createClustering, type ClusteringInstance } from '@/shared/lib/clustering'

import type { Bounds, TimeFilterDefaults } from './model'

import { createPinFromV2, MarkerType, PinV2Type } from '@/shared/types/map'
import type { Pin, PinsGroupV2 } from '@/shared/types/map'

import { fetchPinsV2, fetchPoiMeta, fetchTimeFilterDefaults, fetchTimeFilterFullOptions } from './model'

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }
const DEFAULT_ZOOM = 16
const MAX_CLUSTER_ZOOM = 15
const CLUSTER_GRID_SIZE = 180
const CACHE_TTL = 60_000

interface CachedPinEntry {
  timestamp: number
  pins: Pin[]
}

export interface UseNearbyViewModelOptions {
  /** 지도 여백 클릭 시 호출 (핀/클러스터가 아닌 빈 영역). 시트 close 등에 사용. */
  onMapClick?: () => void
}

export function useNearbyViewModel(options: UseNearbyViewModelOptions = {}) {
  // onMapClick 최신값을 ref로 유지 → initMap 안 이벤트 리스너가 stale closure로 묶이지 않도록
  const onMapClickRef = useRef(options.onMapClick)
  useEffect(() => {
    onMapClickRef.current = options.onMapClick
  })

  const mapRef = useRef<naver.maps.Map | null>(null)
  const cachedMarkers = useRef<Record<string, naver.maps.Marker>>({})
  const cachedPinsMap = useRef<Record<string, CachedPinEntry>>({})
  const lastFetchedRef = useRef<{ bounds: Bounds; timestamp: number } | null>(null)
  const clusteringRef = useRef<ClusteringInstance | null>(null)
  const shareClusteringRef = useRef<ClusteringInstance | null>(null)
  const clusterIconCache = useRef<Map<number, { content: string; size: naver.maps.Size; anchor: naver.maps.Point }>>(
    new Map()
  )
  const shareClusterIconCache = useRef<
    Map<number, { content: string; size: naver.maps.Size; anchor: naver.maps.Point }>
  >(new Map())
  const currentPositionMarkerRef = useRef<naver.maps.Marker | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ─── Time Filter ───
  const [timeFilterOptions, setTimeFilterOptions] = useState<TimeFilterOptions | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedDurationId, setSelectedDurationId] = useState('')
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false)
  const timeDefaultsRef = useRef<TimeFilterDefaults | null>(null)

  // ─── Render Helpers ───

  const measureHtml = useCallback((html: string) => {
    const el = document.createElement('div')
    el.style.position = 'absolute'
    el.style.left = '-9999px'
    el.innerHTML = html
    document.body.appendChild(el)
    const size = { width: el.offsetWidth, height: el.offsetHeight }
    document.body.removeChild(el)
    return size
  }, [])

  const renderMarkerHtml = useCallback(
    (pin: Pin, isOn = false) => ReactDOMServer.renderToString(PoiIcon({ pin, isOn })),
    []
  )

  const generateMarker = useCallback(
    (pin: Pin, isOn = false) => {
      if (!mapRef.current) return null
      const html = renderMarkerHtml(pin, isOn)
      const { width, height } = measureHtml(html)

      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(pin.lat, pin.lng),
        map: mapRef.current,
        icon: {
          content: html,
          size: new naver.maps.Size(width, height),
          anchor: new naver.maps.Point(width / 2, height)
        },
        zIndex: isOn ? 100 : pin.zIndex
      })

      marker.set('seq', pin.seq)
      marker.set('markerType', pin.markerType)
      marker.set('isPartner', pin.isPartner)
      marker.set('hasActivePrimaryTicket', pin.hasActivePrimaryTicket)
      marker.set('zIndex', pin.zIndex)

      return marker
    },
    [renderMarkerHtml, measureHtml]
  )

  // ─── Cluster Icon ───

  const getClusterIcon = useCallback(
    (count: number) => {
      const cached = clusterIconCache.current.get(count)
      if (cached) return cached
      const content = ReactDOMServer.renderToString(ParkingCluster({ count }))
      const { width, height } = measureHtml(content)
      const icon = {
        content,
        size: new naver.maps.Size(width, height),
        anchor: new naver.maps.Point(width / 2, height)
      }
      clusterIconCache.current.set(count, icon)
      return icon
    },
    [measureHtml]
  )

  const getShareClusterIcon = useCallback(
    (count: number) => {
      const cached = shareClusterIconCache.current.get(count)
      if (cached) return cached
      const content = ReactDOMServer.renderToString(ShareCluster({ count }))
      const { width, height } = measureHtml(content)
      const icon = {
        content,
        size: new naver.maps.Size(width, height),
        anchor: new naver.maps.Point(width / 2, height / 2)
      }
      shareClusterIconCache.current.set(count, icon)
      return icon
    },
    [measureHtml]
  )

  const collectVisiblePins = useCallback((): {
    regular: { lat: number; lng: number }[]
    share: { lat: number; lng: number }[]
  } => {
    if (!mapRef.current) return { regular: [], share: [] }
    const mapBounds = mapRef.current.getBounds() as naver.maps.LatLngBounds
    const regular: { lat: number; lng: number }[] = []
    const share: { lat: number; lng: number }[] = []
    Object.values(cachedMarkers.current).forEach((m) => {
      const pos = m.getPosition()
      if (!mapBounds.hasLatLng(pos)) return
      const markerType = m.get('markerType') as MarkerType | undefined
      const item = { lat: pos.y, lng: pos.x }
      if (markerType === MarkerType.NormalShare) share.push(item)
      else regular.push(item)
    })
    return { regular, share }
  }, [])

  const clearClusters = useCallback(() => {
    if (clusteringRef.current) {
      clusteringRef.current.destroy()
      clusteringRef.current = null
    }
    if (shareClusteringRef.current) {
      shareClusteringRef.current.destroy()
      shareClusteringRef.current = null
    }
  }, [])

  const createClusters = useCallback(() => {
    if (!mapRef.current) return
    const { regular, share } = collectVisiblePins()

    if (regular.length === 0 && share.length === 0) {
      clearClusters()
      return
    }

    // ── 일반 클러스터 ──
    if (regular.length === 0) {
      if (clusteringRef.current) {
        clusteringRef.current.destroy()
        clusteringRef.current = null
      }
    } else if (clusteringRef.current) {
      clusteringRef.current.updateItems(regular)
    } else {
      clusteringRef.current = createClustering({
        map: mapRef.current,
        items: regular,
        gridSize: CLUSTER_GRID_SIZE,
        minClusterSize: 2,
        getClusterIcon,
        onClusterClick: (cluster) => {
          if (!mapRef.current) return
          mapRef.current.setCenter(cluster.center)
          mapRef.current.setZoom(MAX_CLUSTER_ZOOM + 1)
        }
      })
    }

    // ── SHARE 전용 클러스터 ──
    if (share.length === 0) {
      if (shareClusteringRef.current) {
        shareClusteringRef.current.destroy()
        shareClusteringRef.current = null
      }
    } else if (shareClusteringRef.current) {
      shareClusteringRef.current.updateItems(share)
    } else {
      shareClusteringRef.current = createClustering({
        map: mapRef.current,
        items: share,
        gridSize: CLUSTER_GRID_SIZE,
        minClusterSize: 2,
        getClusterIcon: getShareClusterIcon,
        onClusterClick: (cluster) => {
          if (!mapRef.current) return
          mapRef.current.setCenter(cluster.center)
          mapRef.current.setZoom(MAX_CLUSTER_ZOOM + 1)
        }
      })
    }
  }, [collectVisiblePins, getClusterIcon, getShareClusterIcon, clearClusters])

  // ─── Marker Overlay (줌/바운드 기반 표시/숨김) ───

  const handleMarkerOverlay = useCallback((marker: naver.maps.Marker) => {
    if (!mapRef.current) return
    const zoom = mapRef.current.getZoom()

    // 줌 레벨 ≤ 15 → 개별 마커 숨김 (클러스터만 표시)
    if (zoom <= MAX_CLUSTER_ZOOM) {
      marker.setMap(null)
      return
    }

    const mapBounds = mapRef.current.getBounds() as naver.maps.LatLngBounds
    if (!mapBounds.hasLatLng(marker.getPosition())) {
      marker.setMap(null)
      return
    }

    marker.setMap(mapRef.current)
  }, [])

  const handleAllMarkersOverlay = useCallback(() => {
    Object.values(cachedMarkers.current).forEach(handleMarkerOverlay)
  }, [handleMarkerOverlay])

  // ─── Clear ───

  const clearAllMarkers = useCallback(() => {
    Object.values(cachedMarkers.current).forEach((m) => m.setMap(null))
    cachedMarkers.current = {}
    cachedPinsMap.current = {}
    lastFetchedRef.current = null
    clearClusters()
  }, [clearClusters])

  // ─── Bounds 유틸 ───

  const getBoundsFromMap = useCallback((): Bounds | null => {
    if (!mapRef.current) return null
    const b = mapRef.current.getBounds() as naver.maps.LatLngBounds
    const sw = b.getSW()
    const ne = b.getNE()
    return { sw: { lat: sw.y, lng: sw.x }, ne: { lat: ne.y, lng: ne.x } }
  }, [])

  const isWithinFetchedBounds = useCallback((current: Bounds, fetched: Bounds) => {
    return (
      current.sw.lat >= fetched.sw.lat &&
      current.sw.lng >= fetched.sw.lng &&
      current.ne.lat <= fetched.ne.lat &&
      current.ne.lng <= fetched.ne.lng
    )
  }, [])

  // ─── Data → Markers ───

  const drawPins = useCallback(
    (groups: PinsGroupV2[]) => {
      const now = Date.now()
      groups.forEach((group) => {
        const pins = group.pins.filter((p) => p.type !== PinV2Type.EV).map((p) => createPinFromV2(p, group.geohash))

        cachedPinsMap.current[group.geohash] = { timestamp: now, pins }

        pins.forEach((pin) => {
          const key = `${group.geohash}/${pin.seq}`
          if (cachedMarkers.current[key]) {
            cachedMarkers.current[key].setMap(null)
            delete cachedMarkers.current[key]
          }
          const marker = generateMarker(pin)
          if (marker) {
            handleMarkerOverlay(marker)
            cachedMarkers.current[key] = marker
          }
        })
      })
    },
    [generateMarker, handleMarkerOverlay]
  )

  // ─── Core: meta → pins 호출 ───

  const loadPinsForBounds = useCallback(
    async (bounds: Bounds) => {
      if (!timeDefaultsRef.current) return

      const isClusterZoom = (mapRef.current?.getZoom() ?? DEFAULT_ZOOM) <= MAX_CLUSTER_ZOOM

      // 캐시 히트: 이전 fetch 영역 안이면 overlay만 갱신
      if (
        lastFetchedRef.current &&
        isWithinFetchedBounds(bounds, lastFetchedRef.current.bounds) &&
        Date.now() - lastFetchedRef.current.timestamp <= CACHE_TTL
      ) {
        handleAllMarkersOverlay()
        if (isClusterZoom) createClusters()
        return
      }

      setIsLoading(true)
      try {
        const meta = await fetchPoiMeta(bounds)
        if (!meta.isPinExist) {
          setIsLoading(false)
          return
        }

        const geohashes = ngeohash.bboxes(bounds.sw.lat, bounds.sw.lng, bounds.ne.lat, bounds.ne.lng, 6).join(',')

        const groups = await fetchPinsV2(geohashes, timeDefaultsRef.current)
        drawPins(groups)

        if ((mapRef.current?.getZoom() ?? DEFAULT_ZOOM) <= MAX_CLUSTER_ZOOM) createClusters()

        lastFetchedRef.current = { bounds, timestamp: Date.now() }
      } catch {
        /* */
      } finally {
        setIsLoading(false)
      }
    },
    [drawPins, handleAllMarkersOverlay, isWithinFetchedBounds, createClusters]
  )

  // ─── Time Filter Handlers ───

  const handleTimeFilterConfirm = useCallback(() => {
    setIsTimeFilterOpen(false)
    timeDefaultsRef.current = { date: selectedDate, durationId: selectedDurationId }
    clearAllMarkers()
    const bounds = getBoundsFromMap()
    if (bounds) loadPinsForBounds(bounds)
  }, [selectedDate, selectedDurationId, clearAllMarkers, getBoundsFromMap, loadPinsForBounds])

  // ─── Map Init ───

  const initMap = useCallback(() => {
    if (!window.naver || mapRef.current) return

    const container = document.getElementById('nearby-map') as HTMLDivElement
    const map = new naver.maps.Map(container, {
      center: new naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      zoom: DEFAULT_ZOOM,
      minZoom: 10,
      maxZoom: 21,
      logoControlOptions: { position: naver.maps.Position.BOTTOM_LEFT },
      mapDataControl: false,
      scaleControl: false
    })

    mapRef.current = map

    // idle → bounds 기반 핀 로드
    naver.maps.Event.addListener(map, 'idle', () => {
      const bounds = getBoundsFromMap()
      if (bounds) loadPinsForBounds(bounds)
    })

    // zoom 변경 → 마커 overlay + 클러스터링 갱신
    naver.maps.Event.addListener(map, 'zoom_changed', () => {
      handleAllMarkersOverlay()
      const zoom = map.getZoom()
      if (zoom <= MAX_CLUSTER_ZOOM) {
        createClusters()
      } else {
        clearClusters()
      }
    })

    // 지도 여백 클릭 (핀/클러스터 click과 별개) → 외부에서 주입한 핸들러 호출
    naver.maps.Event.addListener(map, 'click', () => {
      onMapClickRef.current?.()
    })

    // 시간 필터 기본값 로드 → 첫 핀 로드
    const bootstrap = async () => {
      try {
        const defaults = await fetchTimeFilterDefaults()
        timeDefaultsRef.current = defaults
        setSelectedDate(defaults.date)
        setSelectedDurationId(defaults.durationId)
        const fullOptions = await fetchTimeFilterFullOptions()
        setTimeFilterOptions(fullOptions)
      } catch {
        /* */
      }
      const bounds = getBoundsFromMap()
      if (bounds) loadPinsForBounds(bounds)
    }
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const moveToCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mapRef.current) return
        const position = new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
        mapRef.current.setCenter(position)

        // 이전 현재위치 핀 제거
        if (currentPositionMarkerRef.current) {
          currentPositionMarkerRef.current.setMap(null)
          currentPositionMarkerRef.current = null
        }

        const html = ReactDOMServer.renderToString(CurrentPositionMarker())
        const { width, height } = measureHtml(html)
        currentPositionMarkerRef.current = new naver.maps.Marker({
          position,
          map: mapRef.current,
          icon: {
            content: html,
            size: new naver.maps.Size(width, height),
            anchor: new naver.maps.Point(width / 2, height)
          },
          zIndex: 99
        })
      },
      () => {}
    )
  }, [measureHtml])

  return {
    mapRef,
    isLoading,
    initMap,
    moveToCurrentLocation,
    timeFilterOptions,
    selectedDate,
    selectedDurationId,
    isTimeFilterOpen,
    setSelectedDate,
    setSelectedDurationId,
    openTimeFilter: useCallback(() => setIsTimeFilterOpen(true), []),
    closeTimeFilter: useCallback(() => setIsTimeFilterOpen(false), []),
    handleTimeFilterConfirm
  }
}
