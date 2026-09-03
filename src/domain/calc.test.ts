import { describe, expect, it } from 'vitest'
import { NET_BENEFIT_FLOOR, NET_BENEFIT_RATIO, calculatePlan } from './calc'
import { buildMonthlySpend, isPlanEmpty } from './plan'
import { BANNED_TERMS, CONCLUSION_COPY, findBannedTerms } from '@/content/copy'
import { changeCase, maintainCase } from '@/fixtures'
import { EXPECTED } from '@/fixtures/expected'
import type { Profile } from './types'

const clone = (profile: Profile): Profile => JSON.parse(JSON.stringify(profile)) as Profile

function run(profile: Profile, plan = profile.suggested_plan) {
  return calculatePlan({ profile, plan, constraint: profile.constraint })
}

describe('change_case — 조합 변경 (AC-005·006 · FR-003)', () => {
  const result = run(changeCase)

  it('정답셋과 결론·상태·손익이 일치한다', () => {
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const c = result.calculation
    const expected = EXPECTED.change_case
    expect(c.decision).toBe(expected.decision)
    expect(c.chosen.card_ids).toEqual(expected.chosen)
    expect(c.chosen.statuses).toEqual(expected.statuses)
    expect(c.chosen.gross_benefit).toBe(expected.gross_benefit)
    expect(c.chosen.switching_cost).toEqual(expected.switching_cost)
    expect(c.chosen.net_benefit).toBe(expected.net_benefit)
  })

  it('카드마다 신규·유지·정리 중 정확히 하나를 가진다 (AC-005)', () => {
    if (!result.ok) return
    const statuses = Object.values(result.calculation.chosen.statuses)
    expect(statuses).toHaveLength(changeCase.cards.length - 1)
    for (const status of statuses) expect(['신규', '유지', '정리']).toContain(status)
  })

  it('조합은 제약이 정한 카드 수를 넘지 않고 신규는 최대 1장이다 (T11)', () => {
    if (!result.ok) return
    const chosen = result.calculation.chosen
    expect(chosen.card_ids.length).toBeLessThanOrEqual(changeCase.constraint.max_cards)
    const newCount = chosen.card_ids.filter(
      (id) => !changeCase.cards.find((card) => card.card_id === id)?.owned,
    ).length
    expect(newCount).toBeLessThanOrEqual(1)
  })

  it('상한을 3장으로 올리면 3장 조합까지 후보에 넣는다 (T11)', () => {
    // 상한은 화면 복잡도로 정한 값이라 그 이상은 계산하지 않는다. 3장까지는 열거해야 한다
    const wide = calculatePlan({
      profile: changeCase,
      plan: changeCase.suggested_plan,
      constraint: { ...changeCase.constraint, max_cards: 3 },
    })
    expect(wide.ok).toBe(true)
    if (!wide.ok) return
    const sizes = [wide.calculation.chosen, ...wide.calculation.reviewed].map(
      (item) => item.card_ids.length,
    )
    expect(Math.max(...sizes)).toBeGreaterThan(2)
    expect(Math.max(...sizes)).toBeLessThanOrEqual(3)
  })

  it('배분 합과 계획 총액의 오차가 1원 이하다 (NFR-001)', () => {
    if (!result.ok) return
    const sum = result.calculation.chosen.allocations.reduce((total, row) => total + row.amount, 0)
    expect(Math.abs(sum - EXPECTED.change_case.plan_total)).toBeLessThanOrEqual(1)
  })

  it('이중 임계를 모두 통과했다 (D-002)', () => {
    if (!result.ok) return
    const chosen = result.calculation.chosen
    expect(chosen.net_benefit).toBeGreaterThanOrEqual(NET_BENEFIT_FLOOR)
    expect(chosen.net_benefit).toBeGreaterThanOrEqual(
      Math.floor(chosen.gross_benefit * NET_BENEFIT_RATIO),
    )
  })
})

describe('maintain_case — 현재 조합 유지 (AC-004·013)', () => {
  const result = run(maintainCase)

  it('임계 미달이면 유지를 반환하고 신규·정리는 0건이다', () => {
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const c = result.calculation
    expect(c.decision).toBe('유지')
    expect(c.chosen.card_ids).toEqual(EXPECTED.maintain_case.chosen)
    const statuses = Object.values(c.current.statuses)
    expect(statuses.every((status) => status === '유지')).toBe(true)
    expect(statuses.filter((status) => status !== '유지')).toHaveLength(0)
  })

  it('hold_reason이 반드시 채워진다 (AC-013)', () => {
    if (!result.ok) return
    expect(result.calculation.hold_reason).toBe(EXPECTED.maintain_case.hold_reason)
  })

  it('검토했던 대안을 손익과 함께 남긴다 (T21)', () => {
    if (!result.ok) return
    const best = result.calculation.reviewed[0]
    expect(best).toBeDefined()
    expect(best?.net_benefit).toBe(EXPECTED.maintain_case.best_reviewed_net)
    expect(best?.net_benefit).toBeLessThan(NET_BENEFIT_FLOOR)
  })

  it('유지 결론에서도 배분표를 비우지 않는다 (T21)', () => {
    if (!result.ok) return
    expect(result.calculation.current.allocations.length).toBeGreaterThan(0)
    const sum = result.calculation.current.allocations.reduce((total, row) => total + row.amount, 0)
    expect(Math.abs(sum - EXPECTED.maintain_case.plan_total)).toBeLessThanOrEqual(1)
  })
})

describe('결정론성 (NFR-001)', () => {
  it('같은 입력을 3회 계산해도 결과가 같다', () => {
    const runs = [run(changeCase), run(changeCase), run(changeCase)]
    const serialized = runs.map((item) => JSON.stringify(item))
    expect(new Set(serialized).size).toBe(1)
  })

  it('카드 선언 순서를 바꿔도 결과가 같다 — 동률 규칙이 순서에 의존하지 않는다', () => {
    const shuffled = clone(changeCase)
    shuffled.cards.reverse()
    shuffled.rules.reverse()
    const a = run(changeCase)
    const b = run(shuffled)
    expect(a.ok && b.ok).toBe(true)
    if (!a.ok || !b.ok) return
    expect(b.calculation.chosen.candidate_id).toBe(a.calculation.chosen.candidate_id)
    expect(b.calculation.chosen.net_benefit).toBe(a.calculation.chosen.net_benefit)
    // 근거 배열 순서까지 같아야 한다 — DB 왕복에서 발견한 구멍이다
    expect(b.calculation.evidence).toEqual(a.calculation.evidence)
    expect(b.calculation).toEqual(a.calculation)
  })
})

describe('Empty — 확인할 계획 0건 (AC-001)', () => {
  it('항목을 전부 지우면 결과를 반환하지 않는다', () => {
    const result = run(changeCase, [])
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('EMPTY_PLAN')
  })

  it('금액이 전부 0이면 결과를 반환하지 않는다', () => {
    const zeroed = changeCase.suggested_plan.map((item) => ({ ...item, amount: 0 }))
    expect(isPlanEmpty(zeroed)).toBe(true)
    const result = run(changeCase, zeroed)
    expect(result.ok).toBe(false)
  })

  it('제안값이 있는 첫 진입은 Empty가 아니다 (T3 · T19)', () => {
    expect(isPlanEmpty(changeCase.suggested_plan)).toBe(false)
  })
})

describe('근거 6항목 (AC-002)', () => {
  it('결론 카드는 전원 6항목을 충족한다', () => {
    const result = run(changeCase)
    if (!result.ok) return
    expect(result.calculation.evidence.length).toBeGreaterThan(0)
    for (const row of result.calculation.evidence) {
      expect(row.complete).toBe(true)
      expect(row.missing).toEqual([])
      expect(row.applied_tier).not.toBeNull()
      expect(row.monthly_cap).toBeGreaterThan(0)
      expect(row.excluded.length).toBeGreaterThan(0)
      expect(row.as_of_date).not.toBe('')
      expect(row.unmodeled.length).toBeGreaterThan(0)
    }
  })

  it('출처 없는 미반영 상한은 항목으로 세지 않고 그 카드를 후보에서 뺀다 (T42 · T41)', () => {
    const profile = clone(changeCase)
    const rule = profile.rules.find((item) => item.card_id === 'woori-every')
    rule!.unmodeled = [
      { label: '출처 없는 항목', bound: 9_000, source: { label: '', as_of_date: '' } },
    ]
    const result = run(profile)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.calculation.excluded_cards.map((item) => item.card_id)).toContain('woori-every')
    const shown =
      result.calculation.decision === '변경' ? result.calculation.chosen : result.calculation.current
    expect(shown.card_ids).not.toContain('woori-every')
  })

  it('결론 카드가 미달이면 응답 자체를 거부한다 (AC-002)', () => {
    const profile = clone(changeCase)
    for (const rule of profile.rules) rule.unmodeled = []
    const result = run(profile)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('EVIDENCE_INCOMPLETE')
  })

  it('6항목 미달 카드는 후보 단계에서 제외되고 사유가 남는다 (T41)', () => {
    const profile = clone(changeCase)
    const rule = profile.rules.find((item) => item.card_id === 'samsung-taptap')
    rule!.excluded = []
    const result = run(profile)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.calculation.excluded_cards.map((item) => item.card_id)).toContain('samsung-taptap')
  })

  it('미반영 상한을 결론 차액에 합산하지 않는다 (T7)', () => {
    const base = run(changeCase)
    const inflated = clone(changeCase)
    for (const rule of inflated.rules) {
      for (const item of rule.unmodeled) item.bound *= 10
    }
    const after = run(inflated)
    expect(base.ok && after.ok).toBe(true)
    if (!base.ok || !after.ok) return
    expect(after.calculation.chosen.net_benefit).toBe(base.calculation.chosen.net_benefit)
  })
})

describe('제약과 게이팅 분해 (T38 · FR-003)', () => {
  it('신규 발급을 막으면 신규 카드를 후보로 만들지 않는다', () => {
    const result = calculatePlan({
      profile: changeCase,
      plan: changeCase.suggested_plan,
      constraint: { ...changeCase.constraint, allow_new_card: false },
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const statuses = Object.values(
      result.calculation.decision === '변경'
        ? result.calculation.chosen.statuses
        : result.calculation.current.statuses,
    )
    expect(statuses.filter((status) => status === '신규')).toHaveLength(0)
  })

  it('유지 결론이면 hold_reason이 두 값 중 하나다', () => {
    const result = calculatePlan({
      profile: changeCase,
      plan: changeCase.suggested_plan,
      constraint: { max_cards: 1, allow_new_card: false, max_new_cards: 0 },
    })
    if (!result.ok) return
    if (result.calculation.decision === '유지') {
      expect(['임계미달', '제약과다']).toContain(result.calculation.hold_reason)
    }
  })
})

describe('미래지출은 증가만 받는다 (T10 · UI-002)', () => {
  it('금액을 늘리면 배분 총액도 늘어난다', () => {
    // 계획 0건은 AC-001로 거부되므로 기준선도 1건 이상이어야 한다
    const item = {
      plan_id: 'i1',
      category: '식비',
      spending_months: 1 as const,
      source: 'user' as const,
    }
    const base = run(changeCase, [{ ...item, amount: 300_000 }])
    const added = run(changeCase, [{ ...item, amount: 3_000_000 }])
    expect(base.ok).toBe(true)
    expect(added.ok).toBe(true)
    if (!base.ok || !added.ok) return

    const total = (r: typeof added) =>
      r.ok ? r.calculation.current.allocations.reduce((s, row) => s + row.amount, 0) : 0
    expect(total(added)).toBeGreaterThan(total(base))
  })

  it('배분 금액은 음수가 되지 않는다', () => {
    const result = run(changeCase, [
      {
        plan_id: 'i2',
        category: '식비',
        amount: 99_000_000,
        spending_months: 1 as const,
        source: 'user' as const,
      },
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    for (const row of result.calculation.current.allocations) {
      expect(row.amount).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('지출 기간 (T10 · UI-002)', () => {
  const item = (spending_months: 1 | 3 | 6 | 12, amount: number) => ({
    plan_id: 'd1',
    category: '여행',
    amount,
    spending_months,
    source: 'user' as const,
  })

  it('금액을 기간에 걸쳐 나누고 총액은 정확히 보존한다', () => {
    // 1,000,000을 3으로 나누면 333,333.33… — 달마다 반올림하면 총액이 어긋난다
    const past = [{ category: '여행', monthly_amount: 0 }]
    const months = buildMonthlySpend(past, [item(3, 1_000_000)])
    const spent = months.map((m) => m.get('여행') ?? 0)

    expect(spent.slice(0, 3).reduce((a, b) => a + b, 0)).toBe(1_000_000)
    expect(spent.slice(3).every((v) => v === 0)).toBe(true)
    // 남는 원은 첫 달에 몰아 넣는다
    expect(spent[0]).toBe(333_334)
    expect(spent[1]).toBe(333_333)
    expect(spent[2]).toBe(333_333)
  })

  it('한 번에는 첫 달에만 쌓는다', () => {
    const months = buildMonthlySpend([{ category: '여행', monthly_amount: 0 }], [item(1, 900_000)])
    expect(months[0]?.get('여행')).toBe(900_000)
    expect(months[1]?.get('여행') ?? 0).toBe(0)
  })

  it('과거 기저 위에 더한다 — 덮어쓰지 않는다', () => {
    const past = [{ category: '여행', monthly_amount: 100_000 }]
    const months = buildMonthlySpend(past, [item(12, 1_200_000)])
    expect(months[0]?.get('여행')).toBe(200_000)
    expect(months[11]?.get('여행')).toBe(200_000)
  })

  it('기간이 달라지면 결론 금액도 달라진다 — 월 한도에 걸리는 정도가 다르다', () => {
    const lump = run(changeCase, [item(1, 12_000_000)])
    const spread = run(changeCase, [item(12, 12_000_000)])
    expect(lump.ok && spread.ok).toBe(true)
    if (!lump.ok || !spread.ok) return
    expect(spread.calculation.chosen.gross_benefit).not.toBe(
      lump.calculation.chosen.gross_benefit,
    )
  })
})

describe('금지어 사전 (T26 · QA-01-04)', () => {
  it('결론 배너 카피에 금지어가 없다', () => {
    const samples = [
      CONCLUSION_COPY.change.body('186,000원'),
      CONCLUSION_COPY.change.caption(3),
      CONCLUSION_COPY.hold.body('31,000원'),
      CONCLUSION_COPY.hold.bodyBelowThreshold('31,000원'),
      CONCLUSION_COPY.hold.caption(),
      CONCLUSION_COPY.boundedOptimum,
      CONCLUSION_COPY.relaxHint,
    ]
    for (const text of samples) expect(findBannedTerms(text)).toEqual([])
  })

  it('금지어 사전이 4개 용어를 유지한다', () => {
    expect([...BANNED_TERMS]).toEqual(['총혜택', '최대혜택', '놓쳤어요', '손해보고 있어요'])
  })
})

describe('기준일 경고 (T41)', () => {
  it('3개월을 넘으면 경고만 하고 결과를 무효화하지 않는다', () => {
    const result = calculatePlan({
      profile: changeCase,
      plan: changeCase.suggested_plan,
      constraint: changeCase.constraint,
      today: '2027-01-20',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.calculation.stale_as_of_warning).toBe(true)
    expect(result.calculation.decision).toBe('변경')
  })
})
