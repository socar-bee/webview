const CLUSTER_Z_INDEX = 95

export interface ClusterIcon {
  content: string
  size: naver.maps.Size
  anchor: naver.maps.Point
}

export interface ClusterableItem {
  lat: number
  lng: number
}

export interface ClusteringOptions {
  map: naver.maps.Map
  items: ClusterableItem[]
  gridSize?: number
  minClusterSize?: number
  getClusterIcon: (count: number) => ClusterIcon
  onClusterClick?: (cluster: { center: naver.maps.LatLng; count: number }) => void
}

export interface ClusteringInstance {
  getClusterCount: () => number
  redraw: () => void
  updateItems: (newItems: ClusterableItem[]) => void
  destroy: () => void
}

interface ClusterData {
  center: naver.maps.LatLng | null
  bounds: naver.maps.LatLngBounds | null
  members: ClusterableItem[]
  marker: naver.maps.Marker | null
  clickListener: naver.maps.MapEventListener | null
}

/**
 * 그리드 기반 마커 클러스터링 (함수형).
 */
export function createClustering(options: ClusteringOptions): ClusteringInstance {
  const map = options.map
  let items = options.items
  const gridSize = options.gridSize ?? 120
  const minClusterSize = options.minClusterSize ?? 2
  const getClusterIcon = options.getClusterIcon
  const onClusterClick = options.onClusterClick

  let clusters: ClusterData[] = []

  const idleListener = naver.maps.Event.addListener(map, 'idle', () => redraw())

  if (items.length > 0) redraw()

  function createCluster(): ClusterData {
    return { center: null, bounds: null, members: [], marker: null, clickListener: null }
  }

  function calcBounds(position: naver.maps.LatLng): naver.maps.LatLngBounds {
    const bounds = new naver.maps.LatLngBounds(position.clone(), position.clone())
    const proj = map.getProjection()
    const mapBounds = map.getBounds() as naver.maps.LatLngBounds
    const mapMaxPx = proj.fromCoordToOffset(mapBounds.getNE())
    const mapMinPx = proj.fromCoordToOffset(mapBounds.getSW())
    const maxPx = proj.fromCoordToOffset(bounds.getNE())
    const minPx = proj.fromCoordToOffset(bounds.getSW())
    const half = gridSize / 2

    maxPx.add(half, -half)
    minPx.add(-half, half)

    const newMax = proj.fromOffsetToCoord(
      new naver.maps.Point(Math.min(mapMaxPx.x, maxPx.x), Math.max(mapMaxPx.y, maxPx.y))
    ) as naver.maps.LatLng
    const newMin = proj.fromOffsetToCoord(
      new naver.maps.Point(Math.max(mapMinPx.x, minPx.x), Math.min(mapMinPx.y, minPx.y))
    ) as naver.maps.LatLng

    return new naver.maps.LatLngBounds(newMin, newMax)
  }

  function calcAverageCenter(members: ClusterableItem[]): naver.maps.LatLng {
    let sumLat = 0
    let sumLng = 0
    for (const m of members) {
      sumLat += m.lat
      sumLng += m.lng
    }
    return new naver.maps.LatLng(sumLat / members.length, sumLng / members.length)
  }

  function addItemToCluster(cluster: ClusterData, item: ClusterableItem): void {
    if (!cluster.center) {
      const position = new naver.maps.LatLng(item.lat, item.lng)
      cluster.center = position
      cluster.bounds = calcBounds(position)
    }
    cluster.members.push(item)
  }

  function updateClusterMarker(cluster: ClusterData, icon: ClusterIcon): void {
    if (cluster.members.length < minClusterSize) {
      if (cluster.clickListener) {
        naver.maps.Event.removeListener(cluster.clickListener)
        cluster.clickListener = null
      }
      if (cluster.marker) {
        cluster.marker.setMap(null)
        cluster.marker = null
      }
      return
    }

    const position = calcAverageCenter(cluster.members)

    if (!cluster.marker) {
      cluster.marker = new naver.maps.Marker({ position, map, icon, zIndex: CLUSTER_Z_INDEX })
      if (onClusterClick) {
        cluster.clickListener = naver.maps.Event.addListener(cluster.marker, 'click', () => {
          onClusterClick({ center: position, count: cluster.members.length })
        })
      }
    } else {
      cluster.marker.setPosition(position)
      cluster.marker.setIcon(icon)
      cluster.marker.setMap(map)
    }
  }

  function destroyCluster(cluster: ClusterData): void {
    if (cluster.clickListener) {
      naver.maps.Event.removeListener(cluster.clickListener)
      cluster.clickListener = null
    }
    if (cluster.marker) {
      cluster.marker.setMap(null)
      cluster.marker = null
    }
  }

  function getClosestCluster(position: naver.maps.LatLng): ClusterData {
    const proj = map.getProjection()
    let closest: ClusterData | null = null
    let minDist = Infinity

    for (const cluster of clusters) {
      if (cluster.center && cluster.bounds?.hasLatLng(position)) {
        const dist = proj.getDistance(cluster.center, position)
        if (dist < minDist) {
          minDist = dist
          closest = cluster
        }
      }
    }

    if (!closest) {
      closest = createCluster()
      clusters.push(closest)
    }
    return closest
  }

  function clearClusters(): void {
    for (const cluster of clusters) destroyCluster(cluster)
    clusters = []
  }

  function buildClusters(): void {
    const bounds = map.getBounds() as naver.maps.LatLngBounds
    for (const item of items) {
      const position = new naver.maps.LatLng(item.lat, item.lng)
      if (!bounds.hasLatLng(position)) continue
      addItemToCluster(getClosestCluster(position), item)
    }
  }

  function updateClusters(): void {
    for (const cluster of clusters) {
      updateClusterMarker(cluster, getClusterIcon(cluster.members.length))
    }
  }

  function redraw(): void {
    clearClusters()
    buildClusters()
    updateClusters()
  }

  function destroy(): void {
    naver.maps.Event.removeListener(idleListener)
    clearClusters()
  }

  function getClusterCount(): number {
    return clusters.filter((c) => c.members.length >= minClusterSize).length
  }

  function updateItems(newItems: ClusterableItem[]): void {
    items = newItems
    redraw()
  }

  return { getClusterCount, redraw, updateItems, destroy }
}
