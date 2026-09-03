import type { Profile } from '@/domain/types'

const AS_OF = '2026-08-20'

/**
 * change_case — 조합 변경 결론을 재현하는 내부 정답셋.
 * 실명 카드를 쓰되 수치는 예시다 (T18). 화면 카피에는 사람 이름을 쓰지 않는다 (T17).
 */
export const changeCase: Profile = {
  fixture_id: 'change_case',
  as_of_date: AS_OF,
  cards: [
    {
      card_id: 'shinhan-deep-dream',
      issuer: '신한카드',
      name: 'Deep Dream',
      annual_fee: 12_000,
      official_url: 'https://www.shinhancard.com',
      owned: true,
      qualifying_month_spend: 1_050_000,
      transition: {
        requalification_loss: 0,
        issuance_wait_cost: 0,
        source: { label: '예시 전환비용 — 보유 카드 유지 시 0원', as_of_date: AS_OF },
      },
    },
    {
      card_id: 'samsung-taptap',
      issuer: '삼성카드',
      name: 'taptap O',
      annual_fee: 10_000,
      official_url: 'https://www.samsungcard.com',
      owned: true,
      qualifying_month_spend: 420_000,
      transition: {
        requalification_loss: 10_000,
        issuance_wait_cost: 0,
        source: { label: '예시 전환비용 — 실적 재적립 1개월분', as_of_date: AS_OF },
      },
    },
    {
      card_id: 'lotte-loca',
      issuer: '롯데카드',
      name: 'LOCA 365',
      annual_fee: 8_000,
      official_url: 'https://www.lottecard.co.kr',
      owned: true,
      qualifying_month_spend: 310_000,
      transition: {
        requalification_loss: 5_000,
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
        issuance_wait_cost: 11_980,
        source: { label: '예시 전환비용 — 발급 대기 18일 동안의 혜택 공백', as_of_date: AS_OF },
      },
    },
    {
      card_id: 'hyundai-zero',
      issuer: '현대카드',
      name: 'ZERO Edition3',
      annual_fee: 10_000,
      official_url: 'https://www.hyundaicard.com',
      owned: false,
      qualifying_month_spend: 0,
      transition: {
        requalification_loss: 0,
        issuance_wait_cost: 8_000,
        source: { label: '예시 전환비용 — 발급 대기 중 혜택 공백', as_of_date: AS_OF },
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
      categories: ['식비', '쇼핑', '생활', '교통', '예식', '가전·가구'],
      tiers: [
        { min_monthly_spend: 0, rate: 0.005, monthly_cap: 5_000 },
        { min_monthly_spend: 500_000, rate: 0.01, monthly_cap: 12_000 },
        { min_monthly_spend: 1_000_000, rate: 0.015, monthly_cap: 20_000 },
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
      card_id: 'samsung-taptap',
      rule_version: 'mock-2026.08-b',
      as_of_date: AS_OF,
      effective_from: '2026-01-01',
      effective_to: '2026-12-31',
      categories: ['식비', '쇼핑', '교통'],
      tiers: [
        { min_monthly_spend: 0, rate: 0.003, monthly_cap: 3_000 },
        { min_monthly_spend: 400_000, rate: 0.007, monthly_cap: 7_000 },
      ],
      excluded: ['상품권·기프트카드', '보험료', '대학 등록금'],
      unmodeled: [
        {
          label: '자동납부 승계 여부',
          bound: 6_000,
          source: { label: '삼성카드 자동납부 이전 안내 예시', as_of_date: AS_OF },
        },
      ],
    },
    {
      card_id: 'lotte-loca',
      rule_version: 'mock-2026.08-c',
      as_of_date: AS_OF,
      effective_from: '2026-01-01',
      effective_to: '2026-12-31',
      categories: ['생활', '교통'],
      tiers: [
        { min_monthly_spend: 0, rate: 0.002, monthly_cap: 2_000 },
        { min_monthly_spend: 300_000, rate: 0.005, monthly_cap: 4_000 },
      ],
      excluded: ['상품권·기프트카드', '해외 가맹점'],
      unmodeled: [
        {
          label: '연회비 환급 조건',
          bound: 8_000,
          source: { label: '롯데카드 연회비 반환 예시 조항', as_of_date: AS_OF },
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
        { min_monthly_spend: 500_000, rate: 0.05, monthly_cap: 30_000 },
      ],
      excluded: ['상품권·기프트카드', '해외 가맹점', '무이자 할부 결제분'],
      unmodeled: [
        {
          label: '기존 카드 잔여 포인트 소멸',
          bound: 15_000,
          source: { label: '우리카드 포인트 이관 불가 예시 조항', as_of_date: AS_OF },
        },
        {
          label: '자동납부 이전 시 승계 여부',
          bound: 9_000,
          source: { label: '우리카드 자동납부 이전 안내 예시', as_of_date: AS_OF },
        },
      ],
    },
    {
      card_id: 'hyundai-zero',
      rule_version: 'mock-2026.08-e',
      as_of_date: AS_OF,
      effective_from: '2026-01-01',
      effective_to: '2026-12-31',
      categories: ['식비', '쇼핑', '생활', '교통', '여행'],
      tiers: [
        { min_monthly_spend: 0, rate: 0.007, monthly_cap: 8_000 },
        { min_monthly_spend: 800_000, rate: 0.012, monthly_cap: 14_000 },
      ],
      excluded: ['상품권·기프트카드', '해외 가맹점'],
      unmodeled: [
        {
          label: '전월실적 산정 제외 업종',
          bound: 7_000,
          source: { label: '현대카드 실적 산정 예시 조항', as_of_date: AS_OF },
        },
      ],
    },
  ],
  past_spend: [
    { category: '식비', monthly_amount: 620_000 },
    { category: '쇼핑', monthly_amount: 310_000 },
    { category: '생활', monthly_amount: 240_000 },
    { category: '교통', monthly_amount: 130_000 },
  ],
  suggested_plan: [
    {
      plan_id: 'p1',
      category: '가전·가구',
      amount: 8_400_000,
      spending_months: 1,
      source: 'suggested',
    },
    {
      plan_id: 'p2',
      category: '여행',
      amount: 3_200_000,
      spending_months: 3,
      source: 'suggested',
    },
    {
      plan_id: 'p3',
      category: '예식',
      amount: 4_800_000,
      spending_months: 6,
      source: 'suggested',
    },
  ],
  constraint: { max_cards: 2, allow_new_card: true, max_new_cards: 1 },
}
