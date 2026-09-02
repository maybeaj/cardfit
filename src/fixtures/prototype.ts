/**
 * 기준본 데이터 — `docs/prototype/cardfit-prd-srs-v0.4.html`의 상수를 그대로 옮긴다 (`D-011`).
 *
 * **왜 DB가 아니라 여기인가** — 기준본은 시나리오별 카드 조합과 혜택 금액을 표로 고정해 둔
 * 검증용 Mock이다. 규칙 엔진이 재현할 수 없는 값이라 DB로 우회하면 화면이 기준본과 달라진다.
 * 화면이 기준본과 다르면 기준본이 옳다 — 그래서 기준본의 표를 정본으로 둔다.
 * Prisma 경로(`src/server`)는 실연동 전환 지점으로 남겨둔다 (ADR-001).
 *
 * 모든 수치는 예시다 (`T18`). 실명 카드를 쓰되 화면에 예시임을 함께 밝힌다.
 */

export interface SpendItem {
  id: string
  /** 카테고리 이름. 그대로 결과·근거 화면의 행 이름이 된다 */
  label: string
  /** 만원 단위 입력값 — 기준본의 `amount`와 같은 단위다 */
  amount: number
  /** 얼마 동안 나눠 쓸지. 1이면 `한 번에` */
  spendingMonths: number
}

/** 기준본 `categories` — 순서까지 같다 */
export const CATEGORIES = [
  '여행',
  '주유',
  '교통',
  '쇼핑',
  '음식/배달',
  '통신',
  '카페',
  '구독',
  '전 가맹점',
  '간편결제',
  '편의점',
  '마트',
  '생활',
  '백화점',
  '가전/가구',
  '예식',
  '기타',
] as const

/**
 * 과거 패턴 기반 제안값 (FR-006 · `T3`).
 * 입력 화면은 빈 폼으로 열리지 않는다 — 이 값이 이미 채워진 채 열린다.
 */
export const BASE_SPENDS: SpendItem[] = [
  { id: 'home', label: '가전/가구', amount: 840, spendingMonths: 3 },
  { id: 'travel', label: '여행', amount: 320, spendingMonths: 1 },
  { id: 'event', label: '예식', amount: 480, spendingMonths: 3 },
]

/** 지출 기간 선택지 — `한 번에 / 3개월 / 6개월 / 12개월` (UI-002) */
export const DURATION_OPTIONS = [1, 3, 6, 12] as const

/** 현재 상태 지표 — 관찰값만 노출한다. 절감액·추천 카드를 띄우지 않는다 (`T5`) */
export const CURRENT_STATE = {
  annualSpend: 12_480_000,
  annualBenefit: 486_000,
} as const

export interface OwnedCard {
  name: string
  art: string
  tag: string
  summary: string
  benefits: { icon: string; label: string }[]
}

/** 보유 카드 3장 — 받은 혜택의 합이 `CURRENT_STATE.annualBenefit`과 같다 */
export const OWNED_CARDS: OwnedCard[] = [
  {
    name: '신한 Mr.Life',
    art: '/cards/shinhan-mrlife.png',
    tag: '#생활비',
    summary: '주 사용 · 최근 12개월 혜택 ₩248,000',
    benefits: [
      { icon: '🏪', label: '편의점 10% 할인' },
      { icon: '🚌', label: '대중교통 5% 할인' },
      { icon: '🛍️', label: '온라인 쇼핑 5% 적립' },
      { icon: '🎯', label: '월 2만원 할인 한도' },
    ],
  },
  {
    name: '삼성카드 taptap O',
    art: '/cards/samsung-taptap-o.png',
    tag: '#쇼핑',
    summary: '최근 혜택 사용 낮음 · 받은 혜택 ₩126,000',
    benefits: [
      { icon: '🚕', label: '교통·택시 10% 할인' },
      { icon: '📱', label: '통신요금 10% 할인' },
      { icon: '🎬', label: '영화 5천원 할인' },
      { icon: '🎁', label: '생활 패키지 선택' },
    ],
  },
  {
    name: '신한 Deep Oil',
    art: '/cards/shinhan-deepoil.gif',
    tag: '#교통',
    summary: '월 한도 근접 · 받은 혜택 ₩112,000',
    benefits: [
      { icon: '⛽', label: '선택 주유소 할인' },
      { icon: '🅿️', label: '정비·주차 10% 할인' },
      { icon: '☕', label: '편의점·커피 5% 할인' },
      { icon: '✓', label: '전월 30만원 이상' },
    ],
  },
]

/** 카드마다 `신규·유지·정리` 중 정확히 하나 (AC-005) */
export type CardState = '신규' | '유지' | '정리'

/** 상태별 CSS 접미사 — 배지와 카드 테두리가 같은 의미색을 쓴다 */
export const STATE_CLASS: Record<CardState, string> = {
  신규: 'new',
  유지: 'keep',
  정리: 'organize',
}

export interface OutcomeCard {
  name: string
  state: CardState
  art: string
  /** 예상 연간 혜택 (원) */
  benefit: number
}

/**
 * 시나리오별 카드 조합 — 기준본 `variants`.
 * 게이트를 통과하지 못하면 `HOLD_CARDS`(현재 조합 유지)를 쓴다.
 */
export const SCENARIO_VARIANTS: Record<'low' | 'expected' | 'high', OutcomeCard[]> = {
  low: [
    { name: '신한 Mr.Life', state: '유지', art: '/cards/shinhan-mrlife.png', benefit: 742_000 },
    {
      name: '삼성카드 taptap O',
      state: '유지',
      art: '/cards/samsung-taptap-o.png',
      benefit: 518_000,
    },
    { name: '신한 Deep Oil', state: '신규', art: '/cards/shinhan-deepoil.gif', benefit: 386_000 },
  ],
  expected: [
    { name: '신한 Mr.Life', state: '유지', art: '/cards/shinhan-mrlife.png', benefit: 862_000 },
    {
      name: '삼성카드 taptap O',
      state: '정리',
      art: '/cards/samsung-taptap-o.png',
      benefit: 126_000,
    },
    { name: '신한 Deep Oil', state: '신규', art: '/cards/shinhan-deepoil.gif', benefit: 1_155_000 },
  ],
  high: [
    { name: '신한 Mr.Life', state: '정리', art: '/cards/shinhan-mrlife.png', benefit: 248_000 },
    {
      name: '삼성카드 taptap O',
      state: '유지',
      art: '/cards/samsung-taptap-o.png',
      benefit: 934_000,
    },
    { name: '신한 Deep Oil', state: '신규', art: '/cards/shinhan-deepoil.gif', benefit: 1_496_000 },
  ],
}

/** `현재 조합 유지` 결론에서도 배분을 비우지 않는다 (`T21`) — 현재 조합 기준 값이다 */
export const HOLD_CARDS: OutcomeCard[] = [
  { name: '신한 Mr.Life', state: '유지', art: '/cards/shinhan-mrlife.png', benefit: 486_000 },
  { name: '삼성카드 taptap O', state: '유지', art: '/cards/samsung-taptap-o.png', benefit: 126_000 },
  { name: '신한 Deep Oil', state: '유지', art: '/cards/shinhan-deepoil.gif', benefit: 112_000 },
]

/** 신규 발급은 카드사 공식 페이지로 이동만 시킨다 — 대행하지 않는다 (`T25` · AC-003) */
export const ISSUER_URLS = {
  신한: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1188274_2207.html',
  삼성: 'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?code=AAP1483',
} as const

export function issuerUrl(cardName: string): string {
  return cardName.startsWith('삼성') ? ISSUER_URLS.삼성 : ISSUER_URLS.신한
}

export interface CardRule {
  performance: string
  /** 첫 행이 표 머리글이다 */
  bands: string[][]
  items: { icon: string; title: string; detail: string; limit: string }[]
  caution: string
  url: string
}

/**
 * 카드별 상세 근거 (UI-007 · FR-005).
 * 전문 용어를 쉬운 말로 바꾸지 않는다 — 사용자가 카드사 약관과 대조할 수 있어야 한다 (`T44`).
 */
export const CARD_RULES: Record<string, CardRule> = {
  '신한 Mr.Life': {
    performance: '전월 30만원 이상부터 혜택을 받아요',
    bands: [
      ['전월 실적', '30~50만원', '50~100만원', '100만원 이상'],
      ['공과금 월 한도', '3천원', '7천원', '1만원'],
      ['TIME 월 한도', '1만원', '2만원', '3만원'],
      ['주말 월 한도', '3천원', '7천원', '1만원'],
    ],
    items: [
      { icon: '💡', title: '전기·가스·통신', detail: '자동납부 금액 10%', limit: '1회 최대 5천원' },
      { icon: '🏪', title: '편의점·병원·세탁', detail: '하루 종일 10%', limit: '각 영역 월 5회' },
      {
        icon: '🌙',
        title: '온라인쇼핑·택시·음식',
        detail: '오후 9시~오전 9시 10%',
        limit: '1회 최대 1천원',
      },
      { icon: '🛒', title: '주말 마트·주유', detail: '마트 10%·주유 ℓ당 60원', limit: '토·일만 적용' },
    ],
    caution: '상품권, 선불카드 충전, 카드대출, 연회비와 취소금액은 실적에서 빠져요.',
    url: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1187937_2207.html',
  },
  '삼성카드 taptap O': {
    performance: '전월 30만원 이상이면 생활 혜택을 받아요',
    bands: [
      ['혜택 영역', '할인율', '월 한도', '이용 조건'],
      ['쇼핑 패키지', '7%', '5천원', '선택 쇼핑처'],
      ['스타벅스', '50%', '1만원', '커피 패키지 선택'],
      ['교통·통신', '10%', '통합 5천원', '대중교통·택시·통신'],
    ],
    items: [
      { icon: '🛍️', title: '쇼핑 패키지', detail: '쿠팡 등 선택처 7%', limit: '매월 패키지 선택' },
      {
        icon: '☕',
        title: '커피 패키지',
        detail: '스타벅스 50% 또는 일반 커피 30%',
        limit: '월 한도 안에서 할인',
      },
      {
        icon: '🚌',
        title: '교통·통신',
        detail: '대중교통·택시·이동통신 10%',
        limit: '통합 월 한도 적용',
      },
      { icon: '🎬', title: '영화', detail: 'CGV·롯데시네마 5천원', limit: '지정 결제 조건 확인' },
    ],
    caution: '쇼핑·커피는 선택한 라이프스타일 패키지에 따라 대상처와 할인율이 달라져요.',
    url: 'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?code=AAP1483',
  },
  '신한 Deep Oil': {
    performance: '전월 30만원 이상부터 차량·생활 혜택을 받아요',
    bands: [
      ['전월 실적', '30~70만원', '70만원 이상'],
      ['주유 대상금액', '월 15만원', '월 30만원'],
      ['차량 대상금액', '월 15만원', '월 30만원'],
      ['생활 대상금액', '월 15만원', '월 30만원'],
    ],
    items: [
      { icon: '⛽', title: '선택 정유사', detail: '주유금액 10%', limit: '4곳 중 1곳 선택' },
      { icon: '🔧', title: '정비·주차', detail: '스피드메이트·주차 10%', limit: '두 업종 한도 통합' },
      {
        icon: '☕',
        title: '편의점·커피·택시',
        detail: 'GS25·CU·스타벅스·이디야·택시 5%',
        limit: '세 업종 한도 통합',
      },
      { icon: '🎬', title: '롯데시네마', detail: '일반관 5천원', limit: '월 1회 또는 2회' },
    ],
    caution:
      '주유금액과 LPG, 상품권·선불카드 충전, 무이자할부 등은 실적 또는 할인에서 제외될 수 있어요.',
    url: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1188274_2207.html',
  },
}

/** 근거 6항목 (AC-002). 하나라도 비면 그 카드는 결론에 넣지 않는다 */
export const EVIDENCE_SIX = [
  { no: '01', title: '실적구간', body: '카드별로 전월에 얼마를 써야 혜택이 시작되는지 확인해요.' },
  { no: '02', title: '혜택한도', body: '할인율이 적용되어도 카드별 월 최대 할인액까지만 계산해요.' },
  { no: '03', title: '연회비', body: '신규 카드의 연회비와 기존 카드의 연회비를 비용에 반영해요.' },
  {
    no: '04',
    title: '제외조건',
    body: '상품권·선불충전·취소금액 등 실적과 할인에서 빠지는 거래를 확인해요.',
  },
  {
    no: '05',
    title: '기준일',
    body: '2026-08-21 기준 약관과 rule_version mock-2026-08을 사용했어요.',
  },
  {
    no: '06',
    title: '미반영 항목',
    body: '포인트·마일리지 환산가치, 카드사 이벤트, 승인취소·환불 시점, 가맹점 업종 분류 차이는 계산하지 않았어요.',
  },
] as const
