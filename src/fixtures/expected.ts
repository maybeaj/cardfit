/**
 * 정답셋 — FIXTURE_SPEC.md 4절. 구현이 명세를 조용히 바꾸지 않도록 기대값을 코드에 고정한다.
 */
export const EXPECTED = {
  change_case: {
    decision: '변경',
    chosen: ['shinhan-deep-dream', 'woori-every'],
    statuses: {
      'shinhan-deep-dream': '유지',
      'woori-every': '신규',
      'samsung-taptap': '정리',
      'lotte-loca': '정리',
    },
    gross_benefit: 227_980,
    switching_cost: { annual_fee: 15_000, requalification_loss: 15_000, issuance_wait_cost: 11_980, total: 41_980 },
    net_benefit: 186_000,
    plan_total: 32_000_000,
  },
  maintain_case: {
    decision: '유지',
    hold_reason: '임계미달',
    chosen: ['hana-onq', 'shinhan-deep-dream'],
    best_reviewed_net: 31_000,
    plan_total: 27_440_000,
  },
} as const
