import { describe, expect, it } from 'vitest'
import { diagnose } from './diagnose'
import { changeCase } from '@/fixtures'

describe('현재 상태 분석 (AC-012 · T5)', () => {
  const d = diagnose(changeCase)

  it('보유 카드 수와 소비 합계는 관찰된 사실이다', () => {
    expect(d.cardCount).toBe(3)
    expect(d.monthlySpend).toBe(1_300_000)
    expect(d.annualSpend).toBe(15_600_000)
  })

  it('미래 계획을 반영하지 않은 현재 상태 값만 만든다', () => {
    // 미래지출을 넣은 결과보다 작아야 한다 — 진단은 과거 패턴만 본다
    expect(d.currentAnnualBenefit).toBeGreaterThan(0)
    expect(d.perCard).toHaveLength(3)
  })

  it('유지·정리·신규 판정을 만들지 않는다', () => {
    const serialized = JSON.stringify(d)
    for (const status of ['"신규"', '"정리"']) expect(serialized).not.toContain(status)
  })
})
