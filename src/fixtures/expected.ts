/**
 * 정답셋 — FIXTURE_SPEC.md 4절. 구현이 명세를 조용히 바꾸지 않도록 기대값을 코드에 고정한다.
 *
 * `month_offset`(시점)을 `spending_months`(기간)로 바꾸면서 `change_case`의 혜택 금액이
 * 올랐다 (`gross 227,980 → 258,540`). 지출을 한 달에 몰지 않고 여러 달에 펴면 월 혜택한도에
 * 덜 걸리기 때문이고, 기간 선택이 결과를 바꾼다는 UI-002의 전제 그대로다.
 *
 * 나머지 값은 손대지 않았다 — 결론·선택 카드·카드별 상태·전환비용·계획 총액이 모두 그대로다.
 * `net = gross − switching.total`과 `switching.total = 세 항목의 합`도 다시 확인했다.
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
    gross_benefit: 258_540,
    switching_cost: { annual_fee: 15_000, requalification_loss: 15_000, issuance_wait_cost: 11_980, total: 41_980 },
    net_benefit: 216_560,
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
