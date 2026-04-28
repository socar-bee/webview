import type { HeroBanner, PopularParking, QuickMenuItem, RecommendedRegion } from './types'

// NOTE: v1은 큐레이션 + 모킹 데이터. 향후 API endpoint 생성 시 이 파일만 교체.

const HERO_BANNERS: HeroBanner[] = [
  {
    id: 'launch',
    title: '제휴 주차장\n사전예약 OPEN',
    subtitle: '원하는 시간에 미리 예약하세요',
    background: 'linear-gradient(135deg, #0099FF 0%, #1A56DB 100%)',
    decorEmoji: '🅿️'
  },
  {
    id: 'discount',
    title: '오늘만\n주차권 30% 할인',
    subtitle: '강남·홍대·잠실 핫플 주차장',
    background: 'linear-gradient(135deg, #FF6F61 0%, #C2185B 100%)',
    decorEmoji: '💸'
  },
  {
    id: 'monthly',
    title: '월정기 주차권\n첫 달 할인',
    subtitle: '직장인을 위한 안심 정기권',
    background: 'linear-gradient(135deg, #00C853 0%, #1B5E20 100%)',
    decorEmoji: '📅'
  }
]

const QUICK_MENU: QuickMenuItem[] = [
  // Row 1 — 핵심 플로우
  { id: 'reserve', label: '사전예약', href: '/map', emoji: '🅿️', bgColor: '#FFE0B2' },
  { id: 'trending', label: '인기 주차장', href: '/map', emoji: '📈', bgColor: '#FFCDD2', badge: 'HOT' },
  { id: 'airport', label: '공항예약', href: '/map', emoji: '✈️', bgColor: '#BBDEFB' },
  { id: 'monthly', label: '월정기', href: '/map', emoji: '📅', bgColor: '#C8E6C9' },
  { id: 'shared', label: '공유주차', href: '/map', emoji: '🤝', bgColor: '#FFCCBC' },
  // Row 2 — 사용 시나리오
  { id: 'event', label: '행사장', href: '/map', emoji: '🎤', bgColor: '#FFE8D6' },
  { id: 'department', label: '백화점', href: '/map', emoji: '🛍️', bgColor: '#FFCCE5' },
  { id: 'lowest', label: '최저가', href: '/map', emoji: '💰', bgColor: '#E0F7FA' },
  { id: 'new', label: '신규오픈', href: '/map', emoji: '✨', bgColor: '#FFCDD2', badge: 'N' },
  { id: 'all-benefit', label: '혜택모아', href: '/map', emoji: '🎁', bgColor: '#FFAB91' }
]

const RECOMMENDED_REGIONS: RecommendedRegion[] = [
  {
    id: 'gangnam',
    name: '강남·역삼',
    lat: 37.4979,
    lng: 127.0276,
    gradient: 'linear-gradient(135deg, #FF8A65 0%, #FF5252 100%)',
    emoji: '🏙️',
    badge: '인기'
  },
  {
    id: 'hongdae',
    name: '홍대·합정',
    lat: 37.5563,
    lng: 126.9226,
    gradient: 'linear-gradient(135deg, #7C4DFF 0%, #448AFF 100%)',
    emoji: '🎨',
    badge: '핫플'
  },
  {
    id: 'jamsil',
    name: '잠실·송파',
    lat: 37.5133,
    lng: 127.1,
    gradient: 'linear-gradient(135deg, #FFB74D 0%, #FF7043 100%)',
    emoji: '🎢',
    badge: '인기'
  },
  {
    id: 'myeongdong',
    name: '명동·종로',
    lat: 37.5634,
    lng: 126.9836,
    gradient: 'linear-gradient(135deg, #F06292 0%, #C2185B 100%)',
    emoji: '🛍️'
  },
  {
    id: 'itaewon',
    name: '이태원·한남',
    lat: 37.5341,
    lng: 126.9947,
    gradient: 'linear-gradient(135deg, #4DB6AC 0%, #00897B 100%)',
    emoji: '🌃',
    badge: '핫플'
  },
  {
    id: 'yeouido',
    name: '여의도',
    lat: 37.5219,
    lng: 126.9245,
    gradient: 'linear-gradient(135deg, #4FC3F7 0%, #1976D2 100%)',
    emoji: '🏢'
  },
  {
    id: 'seongsu',
    name: '성수·뚝섬',
    lat: 37.5447,
    lng: 127.0557,
    gradient: 'linear-gradient(135deg, #BA68C8 0%, #6A1B9A 100%)',
    emoji: '☕',
    badge: '핫플'
  },
  {
    id: 'apgujeong',
    name: '압구정·청담',
    lat: 37.5274,
    lng: 127.0286,
    gradient: 'linear-gradient(135deg, #E57373 0%, #B71C1C 100%)',
    emoji: '💎',
    badge: '인기'
  }
]

const POPULAR_PARKINGS: PopularParking[] = [
  {
    seq: 60001,
    name: '강남파이낸스센터',
    shortLabel: '강남·역삼',
    gradient: 'linear-gradient(135deg, #FF8A65 0%, #FF5252 100%)',
    emoji: '🏙️'
  },
  {
    seq: 60002,
    name: '잠실 롯데월드몰',
    shortLabel: '잠실·송파',
    gradient: 'linear-gradient(135deg, #FFB74D 0%, #FF7043 100%)',
    emoji: '🎢'
  },
  {
    seq: 60003,
    name: '홍대입구역 공영',
    shortLabel: '홍대·합정',
    gradient: 'linear-gradient(135deg, #7C4DFF 0%, #448AFF 100%)',
    emoji: '🎨'
  },
  {
    seq: 60004,
    name: '여의도 IFC몰',
    shortLabel: '여의도',
    gradient: 'linear-gradient(135deg, #4FC3F7 0%, #1976D2 100%)',
    emoji: '🏢'
  },
  {
    seq: 60005,
    name: '명동 신세계',
    shortLabel: '명동·종로',
    gradient: 'linear-gradient(135deg, #F06292 0%, #C2185B 100%)',
    emoji: '🛍️'
  },
  {
    seq: 60006,
    name: '성수 디뮤지엄',
    shortLabel: '성수·뚝섬',
    gradient: 'linear-gradient(135deg, #BA68C8 0%, #6A1B9A 100%)',
    emoji: '☕'
  },
  {
    seq: 60007,
    name: '이태원 한남빌딩',
    shortLabel: '이태원·한남',
    gradient: 'linear-gradient(135deg, #4DB6AC 0%, #00897B 100%)',
    emoji: '🌃'
  }
]

export async function fetchHeroBanners(): Promise<HeroBanner[]> {
  return HERO_BANNERS
}

export async function fetchQuickMenu(): Promise<QuickMenuItem[]> {
  return QUICK_MENU
}

export async function fetchRecommendedRegions(): Promise<RecommendedRegion[]> {
  return RECOMMENDED_REGIONS
}

export async function fetchPopularParkings(): Promise<PopularParking[]> {
  return POPULAR_PARKINGS
}
