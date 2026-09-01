import type { Profile } from '@/domain/types'

const AS_OF = '2026-08-20'

/**
 * maintain_case — 과잉 추천 방지를 검증하는 내부 정답셋.
 * 보유 조합이 이미 미래 지출을 잘 덮어 Net Benefit이 절대 임계(5만원)에 못 미친다 → `현재 조합 유지` (AC-004).
 */
export const maintainCase: Profile = {
  fixture_id: 'maintain_case',
  as_of_date: AS_OF,
  cards: [
    {
      card_id: 'shinhan-deep-dream',
      issuer: '신한카드',
      name: 'Deep Dream',
      annual_fee: 12_000,
      official_url: 'https://www.shinhancard.com',
      owned: true,
      qualifying_month_spend: 1_320_000,
      transition: {
        requalification_loss: 0,
        issuance_wait_cost: 0,
        source: { label: '예시 전환비용 — 보유 카드 유지 시 0원', as_of_date: AS_OF },
      },
    },
    {
      card_id: 'hana-onq',
      issuer: '하나카드',
      name: '원큐 데일리',
      annual_fee: 9_000,
      official_url: 'https://www.hanacard.co.kr',
      owned: true,
      qualifying_month_spend: 480_000,
      transition: {
        requalification_loss: 3_000,
        issuance_wait_cost: 0,
        source: { label: '예시 전환비용 — 실적 재적립 1개월분', as_of_date: AS_OF },
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
        issuance_wait_cost: 3_260,
        source: { label: '예시 전환비용 — 발급 대기 5일 동안의 혜택 공백', as_of_date: AS_OF },
      },
    },
  ],
  rules: [
    {
      card_id: 'shinhan-deep-dream',
      rule_version: 'mock-2026.08-a',
      as_of_date: AS_OF,
      effective_from: '2026-01-01',
      effective_to: '2026-12-31',
      categories: ['식비', '쇼핑', '생활', '교통', '예식', '가전·가구', '여행'],
      tiers: [
        { min_monthly_spend: 0, rate: 0.005, monthly_cap: 8_000 },
        { min_monthly_spend: 500_000, rate: 0.03, monthly_cap: 34_000 },
      ],
      excluded: ['상품권·기프트카드', '해외 가맹점', '세금·공과금'],
      unmodeled: [
        {
          label: '기존 포인트 소멸분',
          bound: 20_000,
          source: { label: '신한카드 포인트 약관 예시 조항', as_of_date: AS_OF },
        },
      ],
    },
    {
      card_id: 'hana-onq',
      rule_version: 'mock-2026.08-f',
      as_of_date: AS_OF,
      effective_from: '2026-01-01',
      effective_to: '2026-12-31',
      categories: ['식비', '쇼핑', '생활', '교통'],
      tiers: [
        { min_monthly_spend: 0, rate: 0.004, monthly_cap: 4_000 },
        { min_monthly_spend: 400_000, rate: 0.02, monthly_cap: 3_000 },
      ],
      excluded: ['상품권·기프트카드', '보험료'],
      unmodeled: [
        {
          label: '자동납부 승계 여부',
          bound: 6_000,
          source: { label: '하나카드 자동납부 이전 안내 예시', as_of_date: AS_OF },
        },
      ],
    },
    {
      card_id: 'woori-every',
      rule_version: 'mock-2026.08-d',
      as_of_date: AS_OF,
      effective_from: '2026-01-01',
      effective_to: '2026-12-31',
      categories: ['가전·가구', '여행', '예식', '식비', '쇼핑', '생활', '교통'],
      tiers: [
        { min_monthly_spend: 0, rate: 0.005, monthly_cap: 5_000 },
        { min_monthly_spend: 500_000, rate: 0.02, monthly_cap: 20_000 },
      ],
      excluded: ['상품권·기프트카드', '해외 가맹점', '무이자 할부 결제분'],
      unmodeled: [
        {
          label: '기존 카드 잔여 포인트 소멸',
          bound: 15_000,
          source: { label: '우리카드 포인트 이관 불가 예시 조항', as_of_date: AS_OF },
        },
      ],
    },
  ],
  past_spend: [
    { category: '식비', monthly_amount: 640_000 },
    { category: '쇼핑', monthly_amount: 280_000 },
    { category: '생활', monthly_amount: 260_000 },
    { category: '교통', monthly_amount: 140_000 },
  ],
  suggested_plan: [
    {
      plan_id: 'p1',
      category: '가전·가구',
      amount: 5_600_000,
      direction: 'increase',
      month_offset: 2,
      source: 'suggested',
    },
    {
      plan_id: 'p2',
      category: '여행',
      amount: 2_400_000,
      direction: 'increase',
      month_offset: 3,
      source: 'suggested',
    },
    {
      plan_id: 'p3',
      category: '예식',
      amount: 3_600_000,
      direction: 'increase',
      month_offset: 4,
      source: 'suggested',
    },
  ],
  constraint: { max_cards: 2, allow_new_card: true, max_new_cards: 1 },
}
