# 04 · 제휴주차장 예매 플로우

핀 클릭부터 결제까지의 화면/데이터 흐름.

## 진입 경로

| URL                                                           | 용도                                        |
| ------------------------------------------------------------- | ------------------------------------------- |
| `/map?type=P&id=:seq#sheet=1`                                 | SPA — 지도+`ParkingDetailSheet`             |
| `/p/:id?parkingDate=…&durationId=…`                           | SEO — generateMetadata, ld+json, 동일 sheet |
| `/parking/:id`                                                | 풀스크린 detail 페이지 (탭 4개)             |
| `/parking/:id/payment?couponSeq=…&parkingDate=…&durationId=…` | 결제 (모델만 구현, 페이지 미완)             |

## 데이터 단

핵심 fetch 4종, 모두 `advanceApiClient` 사용 (자세한 정책: [02-api-layer.md](./02-api-layer.md)):

| 함수                                             | 엔드포인트                         | 위치                                        |
| ------------------------------------------------ | ---------------------------------- | ------------------------------------------- |
| `fetchParkingLotDetail(seq, type)`               | GET `/poi/pins/:type/:seq`         | `src/app/parking/[id]/model/api.ts`         |
| `fetchTicketList(seq, parkingDate, durationId?)` | GET `/ticket/list`                 | 같은 파일                                   |
| `fetchTicketDetail(couponSeq, parkingDate)`      | GET `/ticket/:couponSeq`           | 같은 파일                                   |
| `fetchDailyAbleTime(seq, parkingDate)`           | GET `/ticket/:seq/daily-able-time` | `src/app/parking/[id]/payment/model/api.ts` |

쿼리 훅(`queries.ts`)은 모두 `parkingDate`/`durationId`를 **queryKey에 포함** → 시간필터 변경 시 자동 refetch.

## ViewModel — `useParkingDetailViewModel`

- `useSearchParams`로 `parkingDate`/`durationId` 수집 → `useTicketList`에 전달
- `goToPayment(couponSeq)` 시 carry query 함께 push
- `tickets` 항상 fetch (탭별 게이팅 없음 — 스크롤-스파이 구조 전제)

## `ParkingDetailSheet` — 탭 ↔ 스크롤 스파이

`AnimationSheet`(3-snap: peek/half/full) 안에 4개 섹션을 **세로로 나열**하고 sticky 탭으로 네비.

### 핵심 동작

- 탭 클릭 → `scrollToSection(key)` → 컨테이너 `scrollTo({ top: target.offsetTop - tabsHeight, behavior: 'smooth' })`
- 스크롤 → `IntersectionObserver`(`rootMargin: -{tabsHeight}px 0px -80% 0px`)가 활성 섹션 감지 → `setActiveSection`
- 클릭 스크롤 중에는 `isScrollingByClickRef`로 observer 덮어쓰기 차단 (스크롤 종료 후 해제)
- `seq` 변경 시 컨테이너 `scrollTop = 0` + `activeSection = 'tickets'`로 리셋

### 스크롤 컨테이너 식별

`AnimationSheet`의 body div에 `data-sheet-scroll-body` 속성. 자식이 부모를 거슬러 올라가며 이 속성을 가진 노드를 찾는다.

### 섹션 ref

- `ticketsSectionRef`, `infoSectionRef`, `recommendSectionRef`, `nearbySectionRef`
- `data-section` 속성을 attach해 IntersectionObserver entry에서 키를 역추적

### Snap 별 스크롤 가능 여부

- `full` 상태에서만 body가 `overflow-y: auto`. peek/half는 `overflow: hidden + touch-action: none`.
- 스크롤-스파이는 `isOpen`일 때만 attach. peek/half에서 휠/터치는 스크롤 대신 시트 드래그로 연결.

## SEO 페이지 (`/p/[id]/page.tsx`)

- `generateMetadata` 안에서 `getTicketList`로 미리보기용 티켓 정보 조합 → description에 포함
- `parkingDate` 누락 시 `resolveParkingDate(undefined)` → 오늘로 fallback
- 차단 대상 seq(`SEO_BLOCK_PARKINGLOT_SEQ_LIST`)는 `robots: { index: false, follow: false }`
- `revalidate = 600` — 10분 ISR
