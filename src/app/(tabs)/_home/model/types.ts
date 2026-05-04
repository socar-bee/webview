/** Hero 캐러셀 슬라이드. */
export interface HeroBanner {
  id: string
  title: string
  subtitle?: string
  /** 카드 배경 CSS (gradient 등) */
  background: string
  /** 카드 내 강조 이모지/장식 */
  decorEmoji?: string
  /** 배경 이미지 URL — 있으면 background 대신 사용, 텍스트 오버레이 숨김 */
  image?: string
}

/** 퀵메뉴 아이템 (캐치테이블 아이콘 그리드 톤). */
export interface QuickMenuItem {
  id: string
  label: string
  /** 라우트 또는 외부 URL — action이 있으면 무시됨 */
  href?: string
  /** href 대신 onAction 콜백으로 처리할 동작 식별자 */
  action?: string
  /** 아이콘 이모지 (icon 없을 때 사용) */
  emoji?: string
  /** 3D 아이콘 이미지 URL (있으면 emoji + bgColor 대신 사용) */
  icon?: string
  /** 아이콘 배경 색상 (icon 없을 때 사용) */
  bgColor?: string
  /** "N", "HOT" 같은 코너 뱃지 */
  badge?: 'N' | 'HOT'
}

/** 추천 지역 — 라운드 카드. */
export interface RecommendedRegion {
  id: string
  name: string
  /** 지도 이동 좌표 */
  lat: number
  lng: number
  /** 카드 배경 그라데이션 (image 없을 때 fallback) */
  gradient: string
  /** 강조 이모지 */
  emoji: string
  /** 카드 배경 이미지 URL (있으면 gradient 대신 사용) */
  image?: string
  /** "인기"/"핫플" 코너 뱃지 */
  badge?: '인기' | '핫플'
}

/** 인기 주차장 BEST — 사진 가로 스크롤 카드. */
export interface TopParking {
  seq: number
  name: string
  /** 짧은 지역 라벨 */
  areaLabel: string
  /** /public/images 경로 */
  image: string
}

/** 인기 검색 주차장 — BEST 원형 카드. */
export interface PopularParking {
  seq: number
  name: string
  /** 짧은 라벨 (예: "강남·역삼") */
  shortLabel: string
  /** 원형 카드 그라데이션 */
  gradient: string
  emoji: string
  /** /search/[keyword] 로 이동할 검색어 */
  keyword: string
}

/** 인기 검색어 — 주간 Top 랭킹 + WoW 변동률. */
export interface PopularKeyword {
  rank: number
  keyword: string
  /** 주간 탐색 주차장 수 (사이드 정보, 표출 옵션) */
  searchCount: number
  /** WoW 변동률 (% 단위, +상승 / -하락 / 0 보합) */
  wowDelta: number
}
