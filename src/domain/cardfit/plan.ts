import type { FutureSpendPlan, PastSpend } from './types'

export const HORIZON_MONTHS = 12

/** 월별 카테고리 금액. 인덱스 0 = 기준일 +1개월 */
export type MonthlySpend = Map<string, number>[]

/**
 * 확인된 계획을 12개월 월별 금액으로 펼친다 (T15).
 * 입력이 없는 달은 과거 패턴을 기저로 채우고, 사용자가 확인한 값을 임의로 증감하지 않는다.
 */
export function buildMonthlySpend(past: PastSpend[], plan: FutureSpendPlan[]): MonthlySpend {
  const months: MonthlySpend = []
  for (let m = 0; m < HORIZON_MONTHS; m += 1) {
    const bucket = new Map<string, number>()
    for (const p of past) bucket.set(p.category, (bucket.get(p.category) ?? 0) + p.monthly_amount)
    months.push(bucket)
  }
  for (const item of plan) {
    /*
     * 확인한 금액을 기간에 걸쳐 나눈다.
     *
     * 나머지를 버리면 배분 합계가 계획 총액과 어긋난다 (NFR-001 · UI-006). 몫을 바닥으로
     * 깔고 남는 원을 첫 달에 몰아 총액을 정확히 보존한다 — 달마다 반올림하면 최대
     * `기간-1`원이 사라진다.
     */
    const span = Math.min(item.spending_months, HORIZON_MONTHS)
    const base = Math.floor(item.amount / span)
    const remainder = item.amount - base * span
    for (let m = 0; m < span; m += 1) {
      const bucket = months[m]
      if (!bucket) continue
      const add = base + (m === 0 ? remainder : 0)
      bucket.set(item.category, (bucket.get(item.category) ?? 0) + add)
    }
  }
  return months
}

/** 계획이 0건인지 판정한다 — 전부 삭제했거나 금액이 전부 0 (T19 · AC-001) */
export function isPlanEmpty(plan: FutureSpendPlan[]): boolean {
  return plan.length === 0 || plan.every((item) => item.amount === 0)
}

/** 확인한 계획의 합계. 모든 항목이 추가 지출이라 그대로 더한다 (T10) */
export function planTotal(plan: FutureSpendPlan[]): number {
  return plan.reduce((sum, item) => sum + item.amount, 0)
}
