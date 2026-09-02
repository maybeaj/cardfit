/**
 * 마이데이터 CSV 카드의 혜택 규칙과 신규 발급 후보 카드.
 *
 * **왜 여기서 작성하는가** — `cards.csv`에는 카드사·카드명·연회비·발급일만 있고
 * 전월실적 구간·통합할인한도·제외조건·미반영 상한이 없다. 이 4개가 없으면
 * 근거 6항목(AC-002)을 채울 수 없어 카드가 조합 후보에서 전부 제외된다.
 * 신규 발급 후보 카드도 CSV에 없다 — `cards.csv`는 보유 카드만 담는다.
 *
 * **수치의 성격** — 실명 카드를 쓰되 조건은 예시다 (`T18`). 화면에 `예시 수치` 배지와
 * *"수치는 예시이며 실제 약관과 다를 수 있습니다"*를 함께 노출한다.
 * 실적 구간의 하한은 CSV의 실제 전월실적(915,390 / 435,190 / 425,300원)에서
 * 도달 가능한 값으로 잡았다 — 아무도 닿지 못하는 구간을 두면 근거 화면이 늘 최하위 구간만 보여준다.
 *
 * **미반영 상한은 출처를 댈 수 있는 항목만 둔다** (`T42`). 출처를 못 대면 행을 만들지 않고,
 * `0`으로도 두지 않는다 — 없는 것과 0원은 다르다.
 */
import type { BenefitRule, CardProduct } from '@/domain/types'

/** CSV 거래의 마지막 달이 2026-08이라 기준일을 그 달 말일로 둔다. */
export const MYDATA_AS_OF = '2026-08-31'

/** `cards.csv`의 card_id를 그대로 쓴다 — 거래·실적 행과의 연결이 한 번에 맞는다. */
export const HELD_CARD_IDS = ['card_01', 'card_02', 'card_03'] as const

/**
 * 보유 카드의 전환비용.
 *
 * `requalification_loss`는 그 카드를 조합에서 빼면 사라지는 실적 재적립분이고,
 * 보유 카드를 계속 쓰면 0이다. 체크카드는 실적 개념이 약해 손실을 0으로 둔다.
 */
export const HELD_CARD_TRANSITIONS: Record<string, CardProduct['transition']> = {
  card_01: {
    requalification_loss: 0,
    issuance_wait_cost: 0,
    source: { label: '예시 전환비용 — 주 사용 카드를 유지하면 재적립 손실이 없음', as_of_date: MYDATA_AS_OF },
  },
  card_02: {
    requalification_loss: 9_000,
    issuance_wait_cost: 0,
    source: { label: '예시 전환비용 — 실적 재적립 1개월분', as_of_date: MYDATA_AS_OF },
  },
  card_03: {
    requalification_loss: 0,
    issuance_wait_cost: 0,
    source: { label: '예시 전환비용 — 체크카드는 전월실적 재적립이 없음', as_of_date: MYDATA_AS_OF },
  },
}

/**
 * 신규 발급 후보 카드. `owned: false`이며 조합 결론에는 최대 1장만 들어간다 (`T6`).
 * 아웃링크는 카드사 공식 페이지로만 보낸다 — 대행하지 않는다 (`T25`).
 */
export const CANDIDATE_CARDS: CardProduct[] = [
  {
    card_id: 'hyundai-zero-edition3',
    issuer: '현대카드',
    name: 'ZERO Edition3',
    annual_fee: 10_000,
    official_url: 'https://www.hyundaicard.com',
    owned: false,
    qualifying_month_spend: 0,
    transition: {
      requalification_loss: 0,
      issuance_wait_cost: 8_000,
      source: { label: '예시 전환비용 — 발급 대기 중 혜택 공백', as_of_date: MYDATA_AS_OF },
    },
  },
  {
    card_id: 'woori-every',
    issuer: '우리카드',
    name: '카드의정석 EVERY',
    annual_fee: 15_000,
    official_url: 'https://pc.wooricard.com',
    owned: false,
    qualifying_month_spend: 0,
    transition: {
      requalification_loss: 0,
      issuance_wait_cost: 11_980,
      source: { label: '예시 전환비용 — 발급 대기 18일 동안의 혜택 공백', as_of_date: MYDATA_AS_OF },
    },
  },
]

/** 모든 카드에 공통으로 붙는 제외조건. 근거 6항목의 `제외조건`이 비면 카드가 후보에서 빠진다. */
const COMMON_EXCLUSIONS = ['상품권·기프트카드', '해외 가맹점', '세금·공과금']

export const MYDATA_RULES: BenefitRule[] = [
  {
    // 신한카드 Deep Dream — 주 사용 카드. 12개월 결제 1,228만원 중 가장 큰 몫을 담당한다.
    card_id: 'card_01',
    rule_version: 'mock-2026.08-mydata-a',
    as_of_date: MYDATA_AS_OF,
    effective_from: '2026-01-01',
    effective_to: '2026-12-31',
    categories: ['음식/배달', '마트', '쇼핑', '편의점', '카페', '교통', '생활', '구독', '통신'],
    tiers: [
      { min_monthly_spend: 0, rate: 0.003, monthly_cap: 5_000 },
      { min_monthly_spend: 500_000, rate: 0.007, monthly_cap: 15_000 },
      { min_monthly_spend: 1_000_000, rate: 0.01, monthly_cap: 25_000 },
    ],
    excluded: COMMON_EXCLUSIONS,
    unmodeled: [
      {
        label: '기존 포인트 소멸분',
        bound: 20_000,
        source: {
          label: '신한카드 포인트 유효기간 예시 조항 · 2026-08 기준 잔액 85,973P',
          as_of_date: MYDATA_AS_OF,
        },
      },
    ],
  },
  {
    // 삼성 taptap O — 전월실적 435,190원으로 두 번째 구간에 걸친다.
    card_id: 'card_02',
    rule_version: 'mock-2026.08-mydata-b',
    as_of_date: MYDATA_AS_OF,
    effective_from: '2026-01-01',
    effective_to: '2026-12-31',
    categories: ['쇼핑', '음식/배달', '교통', '통신'],
    tiers: [
      { min_monthly_spend: 0, rate: 0.002, monthly_cap: 3_000 },
      { min_monthly_spend: 400_000, rate: 0.005, monthly_cap: 8_000 },
    ],
    excluded: [...COMMON_EXCLUSIONS, '보험료'],
    unmodeled: [
      {
        label: '자동납부 승계 여부',
        bound: 6_000,
        source: { label: '삼성카드 자동납부 이전 안내 예시', as_of_date: MYDATA_AS_OF },
      },
    ],
  },
  {
    // 카카오뱅크 체크카드 — 연회비 0원, 실적 조건 없이 낮은 적립률.
    card_id: 'card_03',
    rule_version: 'mock-2026.08-mydata-c',
    as_of_date: MYDATA_AS_OF,
    effective_from: '2026-01-01',
    effective_to: '2026-12-31',
    categories: ['편의점', '카페', '교통', '구독'],
    tiers: [{ min_monthly_spend: 0, rate: 0.002, monthly_cap: 3_000 }],
    excluded: [...COMMON_EXCLUSIONS, '현금IC 결제분'],
    unmodeled: [
      {
        label: '체크카드 소득공제 차이',
        bound: 12_000,
        source: { label: '카카오뱅크 체크카드 소득공제 안내 예시', as_of_date: MYDATA_AS_OF },
      },
    ],
  },
  {
    // 현대카드 ZERO Edition3 — 실적 조건 없이 전 가맹점 적립. 넓게 덮는 대신 한도가 낮다.
    card_id: 'hyundai-zero-edition3',
    rule_version: 'mock-2026.08-mydata-d',
    as_of_date: MYDATA_AS_OF,
    effective_from: '2026-01-01',
    effective_to: '2026-12-31',
    categories: [
      '음식/배달',
      '마트',
      '쇼핑',
      '편의점',
      '카페',
      '교통',
      '생활',
      '구독',
      '통신',
      '여행',
      '주유',
      '가전/가구',
      '예식',
      '기타',
    ],
    tiers: [{ min_monthly_spend: 0, rate: 0.012, monthly_cap: 40_000 }],
    excluded: [...COMMON_EXCLUSIONS, '무이자 할부 결제분'],
    unmodeled: [
      {
        label: '전월실적 산정 제외 업종',
        bound: 7_000,
        source: { label: '현대카드 실적 산정 예시 조항', as_of_date: MYDATA_AS_OF },
      },
    ],
  },
  {
    // 우리카드 카드의정석 EVERY — 생활 밀착 카테고리에 높은 적립. 실적 50만원을 넘겨야 의미가 있다.
    card_id: 'woori-every',
    rule_version: 'mock-2026.08-mydata-e',
    as_of_date: MYDATA_AS_OF,
    effective_from: '2026-01-01',
    effective_to: '2026-12-31',
    categories: ['음식/배달', '마트', '쇼핑', '편의점', '카페', '생활', '가전/가구', '예식', '여행'],
    tiers: [
      { min_monthly_spend: 0, rate: 0.005, monthly_cap: 5_000 },
      { min_monthly_spend: 500_000, rate: 0.017, monthly_cap: 45_000 },
    ],
    excluded: [...COMMON_EXCLUSIONS, '무이자 할부 결제분'],
    unmodeled: [
      {
        label: '기존 카드 잔여 포인트 소멸',
        bound: 15_000,
        source: { label: '우리카드 포인트 이관 불가 예시 조항', as_of_date: MYDATA_AS_OF },
      },
      {
        label: '자동납부 이전 시 승계 여부',
        bound: 9_000,
        source: { label: '우리카드 자동납부 이전 안내 예시', as_of_date: MYDATA_AS_OF },
      },
    ],
  },
]
