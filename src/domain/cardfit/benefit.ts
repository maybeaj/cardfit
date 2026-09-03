import type { BenefitRule, BenefitTier } from './types'

/**
 * 실적구간과 혜택 계산 — 카드 한 장, 한 달치.
 *
 * 배분 알고리즘(`allocation.ts`)이 카드마다 이 계산을 돌려 한계 혜택을 비교한다.
 * 여기는 "이 카드에 이만큼 쓰면 얼마 받나"만 답하고 누가 결제할지는 모른다.
 */

export function tierFor(rule: BenefitRule, previousSpend: number): BenefitTier | null {
  let picked: BenefitTier | null = null
  for (const tier of rule.tiers) {
    if (previousSpend >= tier.min_monthly_spend) {
      if (!picked || tier.min_monthly_spend > picked.min_monthly_spend) picked = tier
    }
  }
  return picked
}

export function benefitOf(
  rule: BenefitRule | undefined,
  qualifyingSpend: number,
  eligibleSpend: number,
): { benefit: number; tier: BenefitTier | null } {
  if (!rule) return { benefit: 0, tier: null }
  const tier = tierFor(rule, qualifyingSpend)
  if (!tier) return { benefit: 0, tier: null }
  return { benefit: Math.min(tier.monthly_cap, Math.floor(eligibleSpend * tier.rate)), tier }
}
