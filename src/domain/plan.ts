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
    const index = item.month_offset - 1
    const bucket = months[index]
    if (!bucket) continue
    const delta = item.direction === 'increase' ? item.amount : -item.amount
    const next = (bucket.get(item.category) ?? 0) + delta
    bucket.set(item.category, Math.max(0, next))
  }
  return months
}

/** 계획이 0건인지 판정한다 — 전부 삭제했거나 금액이 전부 0 (T19 · AC-001) */
export function isPlanEmpty(plan: FutureSpendPlan[]): boolean {
  return plan.length === 0 || plan.every((item) => item.amount === 0)
}

export function planTotal(plan: FutureSpendPlan[]): number {
  return plan.reduce(
    (sum, item) => sum + (item.direction === 'increase' ? item.amount : -item.amount),
    0,
  )
}
