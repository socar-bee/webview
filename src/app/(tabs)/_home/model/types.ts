/** Hero 캐러셀 슬라이드. */
export interface HeroBanner {
  id: string
  title: string
  subtitle?: string
  /** 카드 배경 (이미지 URL 또는 CSS background) */
  background: string
  /** 카드 내 강조 이모지/장식 */
  decorEmoji?: string
}

/** 퀵메뉴 아이템 (캐치테이블 아이콘 그리드 톤). */
export interface QuickMenuItem {
  id: string
  label: string
  /** 라우트 또는 외부 URL */
  href: string
  /** 아이콘 이모지 (또는 추후 SVG로 교체) */
  emoji: string
  /** 아이콘 배경 색상 (Tailwind/CSS color) */
  bgColor: string
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
  /** 카드 배경 그라데이션 */
  gradient: string
  /** 강조 이모지 */
  emoji: string
  /** "인기"/"핫플" 코너 뱃지 */
  badge?: '인기' | '핫플'
}

/** 인기 주차장 — BEST 원형 카드. */
export interface PopularParking {
  seq: number
  name: string
  /** 짧은 라벨 (예: "강남·역삼") */
  shortLabel: string
  /** 원형 카드 그라데이션 */
  gradient: string
  emoji: string
}
