import type { BenefitRule, BenefitTier, CardEvidence, CardProduct } from './types'
import { ANNUAL_FEE_NOTICE_MONTH } from './constants'

/** AC-002 근거 6항목 — 결론 카드는 전원 충족해야 하고 미달 카드는 후보에서 빠진다 (`T41`) */
export const EVIDENCE_FIELDS = [
  '실적구간',
  '혜택한도',
  '연회비',
  '제외조건',
  '기준일',
  '미반영 항목',
] as const

export function buildEvidenceRow(
  card: CardProduct,
  rule: BenefitRule | undefined,
  appliedTier: BenefitTier | null,
): CardEvidence {
  const missing: string[] = []
  if (!appliedTier) missing.push('실적구간')
  if (!appliedTier?.monthly_cap) missing.push('혜택한도')
  if (!rule || rule.excluded.length === 0) missing.push('제외조건')
  if (!rule?.as_of_date) missing.push('기준일')
  // 출처를 댈 수 없는 미반영 항목은 노출하지 않는다 — 0으로 채우지 않는다 (T42)
  const unmodeled = (rule?.unmodeled ?? []).filter((item) => item.source?.label && item.bound > 0)
  if (unmodeled.length === 0) missing.push('미반영 항목')

  return {
    card_id: card.card_id,
    issuer: card.issuer,
    name: card.name,
    applied_tier: appliedTier
      ? { min_monthly_spend: appliedTier.min_monthly_spend, rate: appliedTier.rate }
      : null,
    monthly_cap: appliedTier?.monthly_cap ?? null,
    annual_fee: card.annual_fee,
    excluded: rule?.excluded ?? [],
    as_of_date: rule?.as_of_date ?? '',
    rule_version: rule?.rule_version ?? '',
    unmodeled,
    annual_fee_whole_window_notice: !card.owned && ANNUAL_FEE_NOTICE_MONTH <= 1,
    complete: missing.length === 0,
    missing,
  }
}

export function monthsBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`)
  const b = new Date(`${to}T00:00:00Z`)
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth())
}
