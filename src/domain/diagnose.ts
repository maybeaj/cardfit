import { HORIZON_MONTHS, buildMonthlySpend } from './plan'
import type { BenefitRule, BenefitTier, Profile } from './types'

/**
 * 현재 상태 분석 — 최근 12개월 소비 기준의 관찰값만 만든다.
 * 유지·정리·신규 판정과 CardFit 최종 조합은 만들지 않는다 (S03 · AC-012 · T5).
 */
export interface Diagnosis {
  cardCount: number
  /** 최근 12개월 월평균 소비 */
  monthlySpend: number
  annualSpend: number
  /** 과거 패턴만으로 계산한 현재 조합의 연 혜택 */
  currentAnnualBenefit: number
  /** 규칙상 받을 수 있었지만 한도를 다 쓰지 못한 금액 */
  unusedCapAnnual: number
  /** 실적 구간이 최저 단계에 머문 보유 카드 수 */
  underQualifiedCards: number
  perCard: {
    card_id: string
    issuer: string
    name: string
    annual_fee: number
    monthlyBenefit: number
    tier: BenefitTier | null
    tierIsLowest: boolean
    categories: string[]
  }[]
}

function lowestTier(rule: BenefitRule): BenefitTier | null {
  return [...rule.tiers].sort((a, b) => a.min_monthly_spend - b.min_monthly_spend)[0] ?? null
}

function tierFor(rule: BenefitRule, spend: number): BenefitTier | null {
  let picked: BenefitTier | null = null
  for (const tier of rule.tiers) {
    if (spend >= tier.min_monthly_spend) {
      if (!picked || tier.min_monthly_spend > picked.min_monthly_spend) picked = tier
    }
  }
  return picked
}

export function diagnose(profile: Profile): Diagnosis {
  const owned = profile.cards.filter((card) => card.owned)
  const monthlySpend = profile.past_spend.reduce((sum, item) => sum + item.monthly_amount, 0)
  // 미래 계획을 넣지 않은 과거 패턴만의 월별 지출
  const months = buildMonthlySpend(profile.past_spend, [])
  const firstMonth = months[0]

  let currentAnnualBenefit = 0
  let unusedCapAnnual = 0
  let underQualifiedCards = 0

  const perCard = owned.map((card) => {
    const rule = profile.rules.find((item) => item.card_id === card.card_id)
    const eligible = rule
      ? [...(firstMonth?.entries() ?? [])]
          .filter(([category]) => rule.categories.includes(category) && !rule.excluded.includes(category))
          .reduce((sum, [, amount]) => sum + amount, 0)
      : 0
    const tier = rule ? tierFor(rule, card.qualifying_month_spend) : null
    const monthlyBenefit = tier ? Math.min(tier.monthly_cap, Math.floor(eligible * tier.rate)) : 0
    const tierIsLowest = Boolean(
      rule && tier && lowestTier(rule)?.min_monthly_spend === tier.min_monthly_spend,
    )
    if (tierIsLowest) underQualifiedCards += 1
    currentAnnualBenefit += monthlyBenefit * HORIZON_MONTHS
    unusedCapAnnual += Math.max(0, (tier?.monthly_cap ?? 0) - monthlyBenefit) * HORIZON_MONTHS

    return {
      card_id: card.card_id,
      issuer: card.issuer,
      name: card.name,
      annual_fee: card.annual_fee,
      monthlyBenefit,
      tier,
      tierIsLowest,
      categories: rule?.categories ?? [],
    }
  })

  return {
    cardCount: owned.length,
    monthlySpend,
    annualSpend: monthlySpend * HORIZON_MONTHS,
    currentAnnualBenefit,
    unusedCapAnnual,
    underQualifiedCards,
    perCard,
  }
}
