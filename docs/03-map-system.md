# 03 · Map System

지도 탭(`src/app/(tabs)/map`)의 핵심 동작 정리. 함정 위주.

## 초기화 흐름

1. `MapView`가 `useMapViewModel({ onMapClick, onPinClick, searchCoords })` 호출
2. `vm.initMap()` 호출 — Naver Maps 스크립트는 동적으로 로드
3. `mapRef.current = map` 세팅 후 즉시 `updateBounds()` 1회 수동 실행 (idle은 발화하지 않으므로)
4. `idle` 리스너 attach → 이후 사용자 인터랙션마다 자동 업데이트
5. `pendingLocationMoveRef`가 있으면 (init 전에 `moveToCurrentLocation` 호출됐다면) geolocation으로 이동

## React state ↔ 지도 동기화

쿼리는 다음 state가 모두 갖춰져야만 발화한다:

```ts
const pinsQueryParams = mapBounds && geohashes && timeFilter ? { bounds: mapBounds, geohashes, timeFilter } : null
```

- `mapBounds` / `geohashes` ← `idle` 또는 수동 `updateBounds`
- `timeFilter` ← `useTimeFilterOptions().defaults` 로딩 후 set

## 함정: `setCenter` ≠ `idle`

**Naver Maps에서 `map.setCenter(...)` 같은 프로그램적 카메라 이동은 항상 `idle` 이벤트를 발화시키지 않는다.** 즉시 idle 상태에 있으면 fire하지 않거나, 타이밍이 늦어 React state에 반영되지 못하는 경우가 있다.

이 결과:

- API는 default center 기준 bounds로 fetch
- 지도는 사용자 위치로 이동
- 357개 핀이 모두 `outOfBounds` 처리되어 화면에 0개 표시 ← 실제로 발생한 버그

### 대응

`updateBoundsRef`(useRef)를 통해 `initMap` 내부의 `updateBounds`를 외부 노출. **모든 프로그램적 `setCenter` 호출 직후 명시적으로 호출한다:**

```ts
mapRef.current.setCenter(position)
updateBoundsRef.current?.()
```

대상 호출 사이트:

- `centerOnLatLng`
- `moveToSearchCoords`
- `moveToCurrentLocation` 콜백
- `initMap` 안 `pendingLocationMoveRef` 콜백

사용자 드래그/줌은 `idle`이 정상 발화하므로 그대로 둔다.

## 마커 캐싱

마커 재생성 비용(특히 `ReactDOMServer.renderToString` + `measureHtml`)이 크기 때문에 두 단계로 캐시한다.

1. **아이콘 캐시** (`markerIconCache`): `markerType|label|ticketName|ticketPrice|isOn` 키로 `{content, size, anchor}` 저장
2. **fingerprint 캐시** (`pinFingerprints`): 마커별 시각 fingerprint 저장 → 동일하면 재생성 스킵

`drawPins` 안에서:

- fingerprint 동일 → `handleMarkerOverlay`만 재호출 (visibility 갱신)
- 다르거나 신규 → 기존 마커 destroy + 새로 생성

## 마커 가시성 정책 — `handleMarkerOverlay`

마커가 화면에 보일지 결정. 모든 마커 attach/detach는 이 함수를 거친다.

```
zoom ≤ MAX_CLUSTER_ZOOM(15) → 개별 마커 hide (클러스터만 표시)
bounds.hasLatLng(pos) === false → hide
buyableOnly && !hasActivePrimaryTicket → hide
otherwise → show
```

## 클러스터링

- `MAX_CLUSTER_ZOOM = 15` 이하에서 활성. `naver-maps-clustering` 사용.
- regular / share 두 종류 클러스터 운영 (`MarkerType.NormalShare`만 share 클러스터로).
- 클러스터 클릭 시 `setZoom(MAX_CLUSTER_ZOOM + 1)` → 자연스럽게 개별 마커 모드로 전환.

## 시간 필터

- `useTimeFilterOptions()` — 세션 동안 안 바뀜 → `staleTime: Infinity`.
- 변경 시 `setTimeFilter` → `pinsQueryParams` 변경 → `usePins` refetch.
- URL 동기화는 아직 부분적 (모주 web-app `milestone/ticket-reservation`처럼 `?parkingDate=&durationId=` 쓰기 쪽까지 확장하는 작업이 남아 있음).

## 지도 SDK 키

`process.env.NEXT_PUBLIC_NAVER_MAPS_KEY` — `<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=...">` 로 동적 로드.

## 지도 위 UI 위치

- `z-[var(--z-map-ui)]` 레이어에 검색바, 시간필터 칩, 구매가능 칩, 현재위치 버튼, 로딩 Lottie 배치.
- `--dock-height` CSS 변수는 `DockBar`가 ResizeObserver로 셋. AnimationSheet/필터시트가 dock 위로 안 깔리도록 `bottom: var(--dock-height, 0px)` 활용.
