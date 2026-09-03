import { describe, expect, it } from 'vitest'
import { calculatePlan } from '@/domain/cardfit/calculate-plan'
import { changeCase, maintainCase } from '@/fixtures'
import { EXPECTED } from '@/fixtures/expected'
import { loadProfile } from './profile.repository'

/**
 * TEC-03·04·06 — Migration·Seed·Repository가 계산 결과를 바꾸지 않는지 검증한다.
 * DB를 거쳐도 정답셋이 같아야 데이터 계층이 무손실이다 (NFR-001).
 */
describe('Repository — DB 왕복이 정답셋을 보존한다', () => {
  it('change_case: 거래 단위 적재를 월평균으로 되돌려도 값이 같다', async () => {
    const loaded = await loadProfile('change_case')
    expect(loaded.ok).toBe(true)
    if (!loaded.ok) return
    const byCategory = (rows: { category: string }[]) =>
      [...rows].sort((a, b) => a.category.localeCompare(b.category))
    expect(byCategory(loaded.data.past_spend)).toEqual(byCategory(changeCase.past_spend))
    expect(loaded.data.cards).toHaveLength(changeCase.cards.length)
    expect(loaded.data.rules).toHaveLength(changeCase.rules.length)
    expect(loaded.data.as_of_date).toBe(changeCase.as_of_date)
  })

  it('change_case: DB 기반 계산이 Fixture 기반 계산과 완전히 같다', async () => {
    const loaded = await loadProfile('change_case')
    if (!loaded.ok) throw new Error(loaded.error.code)
    const fromDb = calculatePlan({
      profile: loaded.data,
      plan: loaded.data.suggested_plan,
      constraint: loaded.data.constraint,
    })
    const fromFixture = calculatePlan({
      profile: changeCase,
      plan: changeCase.suggested_plan,
      constraint: changeCase.constraint,
    })
    expect(fromDb.ok && fromFixture.ok).toBe(true)
    if (!fromDb.ok || !fromFixture.ok) return
    expect(fromDb.calculation).toEqual(fromFixture.calculation)
    expect(fromDb.calculation.chosen.net_benefit).toBe(EXPECTED.change_case.net_benefit)
  })

  it('maintain_case: 유지 결론과 hold_reason이 보존된다', async () => {
    const loaded = await loadProfile('maintain_case')
    if (!loaded.ok) throw new Error(loaded.error.code)
    const result = calculatePlan({
      profile: loaded.data,
      plan: loaded.data.suggested_plan,
      constraint: loaded.data.constraint,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.calculation.decision).toBe('유지')
    expect(result.calculation.hold_reason).toBe(EXPECTED.maintain_case.hold_reason)
    expect(result.calculation.reviewed[0]?.net_benefit).toBe(EXPECTED.maintain_case.best_reviewed_net)
    const fromFixture = calculatePlan({
      profile: maintainCase,
      plan: maintainCase.suggested_plan,
      constraint: maintainCase.constraint,
    })
    if (!fromFixture.ok) return
    expect(result.calculation).toEqual(fromFixture.calculation)
  })

  it('없는 Fixture는 성공 결과를 만들지 않는다', async () => {
    const loaded = await loadProfile('does_not_exist')
    expect(loaded.ok).toBe(false)
    if (loaded.ok) return
    expect(loaded.error.code).toBe('FIXTURE_UNAVAILABLE')
    expect(loaded.error.retryable).toBe(true)
    expect(loaded.error.message).not.toBe('')
  })
})
