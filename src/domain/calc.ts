import { HORIZON_MONTHS, buildMonthlySpend, isPlanEmpty, type MonthlySpend } from './plan'
import type {
  AllocationRow,
  BenefitRule,
  BenefitTier,
  CalculationResult,
  CardEvidence,
  CardProduct,
  CardStatus,
  Constraint,
  FutureSpendPlan,
  HoldReason,
  PlanCandidate,
  Profile,
  SwitchingCost,
} from './types'

/** D-002 — 실측이 아니라 과잉 추천을 막는 팀 합의 상수 🟡 */
export const NET_BENEFIT_FLOOR = 50_000
export const NET_BENEFIT_RATIO = 0.15
/** T41 — 기준일 경고 임계 (팀 상수 🟡) */
export const STALE_AS_OF_MONTHS = 3
/** T40 — 12개월 창의 7개월 이후 발급이면 연회비 통째 반영을 고지한다 */
export const ANNUAL_FEE_NOTICE_MONTH = 7

const EVIDENCE_FIELDS = ['실적구간', '혜택한도', '연회비', '제외조건', '기준일', '미반영 항목'] as const

function tierFor(rule: BenefitRule, previousSpend: number): BenefitTier | null {
  let picked: BenefitTier | null = null
  for (const tier of rule.tiers) {
    if (previousSpend >= tier.min_monthly_spend) {
      if (!picked || tier.min_monthly_spend > picked.min_monthly_spend) picked = tier
    }
  }
  return picked
}

function benefitOf(
  rule: BenefitRule | undefined,
  qualifyingSpend: number,
  eligibleSpend: number,
): { benefit: number; tier: BenefitTier | null } {
  if (!rule) return { benefit: 0, tier: null }
  const tier = tierFor(rule, qualifyingSpend)
  if (!tier) return { benefit: 0, tier: null }
  return { benefit: Math.min(tier.monthly_cap, Math.floor(eligibleSpend * tier.rate)), tier }
}

interface Simulation {
  grossBenefit: number
  allocations: AllocationRow[]
  /** 카드별 적용 실적구간 — 근거 화면이 읽는다 */
  appliedTier: Map<string, BenefitTier>
}

interface Bucket {
  /** 실적 산정 대상 배분액 (제외 항목 제외) */
  qualifying: number
  /** 혜택 산정 대상 배분액 */
  eligible: number
  benefit: number
}

/**
 * 조합 하나를 12개월 시뮬레이션한다.
 *
 * 실적구간은 그 달에 카드로 배분된 금액으로 판정한다. 전월실적을 직전 달 값으로 물리면
 * 배분과 실적이 서로를 참조해 순환하므로, 12개월 균질 계획에서는 같은 달 배분액으로 근사하고
 * 그 사실을 근거 화면에 고지한다. 이 방식은 같은 입력에 항상 같은 결과를 준다 (NFR-001).
 */
function simulate(
  cardIds: string[],
  cards: Map<string, CardProduct>,
  rules: Map<string, BenefitRule>,
  months: MonthlySpend,
): Simulation {
  const ordered = [...cardIds].sort()
  const rows = new Map<string, AllocationRow>()
  const appliedTier = new Map<string, BenefitTier>()
  let grossBenefit = 0

  for (let m = 0; m < HORIZON_MONTHS; m += 1) {
    const monthBucket = months[m]
    if (!monthBucket) continue

    const state = new Map<string, Bucket>()
    for (const id of ordered) state.set(id, { qualifying: 0, eligible: 0, benefit: 0 })

    const categories = [...monthBucket.entries()]
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0], 'ko'))

    for (const [category, amount] of categories) {
      let bestId = ordered[0] as string
      let bestMarginal = -1
      let bestNext: Bucket | null = null

      for (const id of ordered) {
        const rule = rules.get(id)
        const current = state.get(id) as Bucket
        const isExcluded = rule?.excluded.includes(category) ?? true
        const isCovered = (rule?.categories.includes(category) ?? false) && !isExcluded
        const next: Bucket = {
          qualifying: current.qualifying + (isExcluded ? 0 : amount),
          eligible: current.eligible + (isCovered ? amount : 0),
          benefit: 0,
        }
        const { benefit } = benefitOf(rule, next.qualifying, next.eligible)
        next.benefit = benefit
        const marginal = benefit - current.benefit
        if (marginal > bestMarginal) {
          bestMarginal = marginal
          bestId = id
          bestNext = next
        }
      }

      const previous = (state.get(bestId) as Bucket).benefit
      if (bestNext) state.set(bestId, bestNext)
      const gained = Math.max(0, (state.get(bestId) as Bucket).benefit - previous)
      grossBenefit += gained

      const key = `${category}::${bestId}`
      const row = rows.get(key)
      if (row) {
        row.amount += amount
        row.benefit += gained
      } else {
        rows.set(key, { category, card_id: bestId, amount, benefit: gained })
      }
    }

    for (const id of ordered) {
      const rule = rules.get(id)
      const bucket = state.get(id) as Bucket
      const tier = rule ? tierFor(rule, bucket.qualifying) : null
      if (tier) appliedTier.set(id, tier)
    }
  }

  const allocations = [...rows.values()].sort(
    (a, b) => (b.amount - a.amount) || a.category.localeCompare(b.category, 'ko'),
  )
  return { grossBenefit, allocations, appliedTier }
}

function switchingCostFor(
  cardIds: string[],
  ownedIds: string[],
  cards: Map<string, CardProduct>,
): SwitchingCost {
  const inCombo = new Set(cardIds)
  let annual_fee = 0
  let issuance_wait_cost = 0
  let requalification_loss = 0

  for (const id of cardIds) {
    const card = cards.get(id)
    if (!card || card.owned) continue
    // 연회비는 12개월 창 안에서 안분하지 않는다 (T40)
    annual_fee += card.annual_fee
    issuance_wait_cost += card.transition.issuance_wait_cost
  }
  for (const id of ownedIds) {
    if (inCombo.has(id)) continue
    requalification_loss += cards.get(id)?.transition.requalification_loss ?? 0
  }
  return {
    annual_fee,
    requalification_loss,
    issuance_wait_cost,
    total: annual_fee + requalification_loss + issuance_wait_cost,
  }
}

function statusesFor(cardIds: string[], ownedIds: string[], cards: Map<string, CardProduct>) {
  const inCombo = new Set(cardIds)
  const statuses: Record<string, CardStatus> = {}
  for (const id of cardIds) {
    statuses[id] = cards.get(id)?.owned ? '유지' : '신규'
  }
  for (const id of ownedIds) {
    if (!inCombo.has(id)) statuses[id] = '정리'
  }
  return statuses
}

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]]
  if (size > items.length) return []
  const out: T[][] = []
  const walk = (start: number, picked: T[]) => {
    if (picked.length === size) {
      out.push([...picked])
      return
    }
    for (let i = start; i < items.length; i += 1) {
      picked.push(items[i] as T)
      walk(i + 1, picked)
      picked.pop()
    }
  }
  walk(0, [])
  return out
}

function buildEvidenceRow(
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

function monthsBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`)
  const b = new Date(`${to}T00:00:00Z`)
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth())
}

export interface CalculateInput {
  profile: Profile
  /** 사용자가 `이 계획대로 계산하기`로 확인한 계획 */
  plan: FutureSpendPlan[]
  constraint: Constraint
  /** 계산 시점. 기준일 경고 판정에만 쓴다 */
  today?: string
}

export function calculatePlan(input: CalculateInput): CalculationResult {
  const { profile, plan, constraint } = input
  const today = input.today ?? profile.as_of_date

  // AC-001 — 확인할 미래 계획이 0건이면 결과를 반환하지 않는다
  if (isPlanEmpty(plan)) {
    return { ok: false, code: 'EMPTY_PLAN', reason: '확인할 앞으로의 지출 계획이 0건입니다.' }
  }

  const cards = new Map(profile.cards.map((card) => [card.card_id, card]))
  const rules = new Map(profile.rules.map((rule) => [rule.card_id, rule]))
  const months = buildMonthlySpend(profile.past_spend, plan)

  // T41 — 6항목 미달 카드는 조합 후보 단계에서 제외하고 사유를 남긴다
  const excluded_cards: { card_id: string; reason: string }[] = []
  const eligible: CardProduct[] = []
  for (const card of profile.cards) {
    const rule = rules.get(card.card_id)
    const probe = simulate([card.card_id], cards, rules, months)
    const row = buildEvidenceRow(card, rule, probe.appliedTier.get(card.card_id) ?? null)
    if (row.complete) eligible.push(card)
    else excluded_cards.push({ card_id: card.card_id, reason: `근거 미달: ${row.missing.join('·')}` })
  }

  const ownedIds = profile.cards.filter((card) => card.owned).map((card) => card.card_id)
  const eligibleOwned = eligible.filter((card) => card.owned).map((card) => card.card_id)
  const eligibleNew = eligible.filter((card) => !card.owned).map((card) => card.card_id)

  const makeCandidate = (cardIds: string[], relaxed: boolean, currentGross: number): PlanCandidate => {
    const sim = simulate(cardIds, cards, rules, months)
    const switching = switchingCostFor(cardIds, ownedIds, cards)
    const grossDelta = sim.grossBenefit - currentGross
    const net = grossDelta - switching.total
    return {
      candidate_id: [...cardIds].sort().join('+'),
      card_ids: [...cardIds].sort(),
      statuses: statusesFor(cardIds, ownedIds, cards),
      gross_benefit_absolute: sim.grossBenefit,
      gross_benefit: grossDelta,
      switching_cost: switching,
      net_benefit: net,
      passes_threshold:
        net >= NET_BENEFIT_FLOOR && net >= Math.floor(grossDelta * NET_BENEFIT_RATIO),
      allocations: sim.allocations,
      relaxed,
    }
  }

  // 현재 조합 — 비교 기준선. 전환비용 0, 차액 0
  const currentSim = simulate(ownedIds, cards, rules, months)
  const current: PlanCandidate = {
    candidate_id: [...ownedIds].sort().join('+'),
    card_ids: [...ownedIds].sort(),
    statuses: Object.fromEntries(ownedIds.map((id) => [id, '유지' as CardStatus])),
    gross_benefit_absolute: currentSim.grossBenefit,
    gross_benefit: 0,
    switching_cost: { annual_fee: 0, requalification_loss: 0, issuance_wait_cost: 0, total: 0 },
    net_benefit: 0,
    passes_threshold: false,
    allocations: currentSim.allocations,
    relaxed: false,
  }

  const buildSet = (maxCards: number, maxNew: number, relaxed: boolean): PlanCandidate[] => {
    const out: PlanCandidate[] = []
    const newAllowed = constraint.allow_new_card ? Math.min(maxNew, eligibleNew.length) : 0
    for (let total = 1; total <= maxCards; total += 1) {
      for (let newCount = 0; newCount <= Math.min(newAllowed, total); newCount += 1) {
        const keepCount = total - newCount
        for (const keep of combinations(eligibleOwned, keepCount)) {
          for (const fresh of combinations(eligibleNew, newCount)) {
            const ids = [...keep, ...fresh]
            if (ids.length === 0) continue
            if ([...ids].sort().join('+') === current.candidate_id) continue
            out.push(makeCandidate(ids, relaxed, currentSim.grossBenefit))
          }
        }
      }
    }
    return out
  }

  const candidates = buildSet(constraint.max_cards, constraint.max_new_cards, false)
  const rank = (a: PlanCandidate, b: PlanCandidate) => {
    if (b.net_benefit !== a.net_benefit) return b.net_benefit - a.net_benefit
    const aNew = a.card_ids.filter((id) => !cards.get(id)?.owned).length
    const bNew = b.card_ids.filter((id) => !cards.get(id)?.owned).length
    if (aNew !== bNew) return aNew - bNew
    if (a.card_ids.length !== b.card_ids.length) return a.card_ids.length - b.card_ids.length
    return a.candidate_id.localeCompare(b.candidate_id)
  }

  const passing = candidates.filter((item) => item.passes_threshold).sort(rank)
  const failing = candidates.filter((item) => !item.passes_threshold).sort(rank)

  let decision: '변경' | '유지' = '유지'
  let hold_reason: HoldReason | null = null
  let chosen = current

  if (passing.length > 0) {
    decision = '변경'
    chosen = passing[0] as PlanCandidate
  } else {
    // T38 — 제약을 완화한 가상 후보가 임계를 넘으면 `제약과다`, 완화해도 못 넘으면 `임계미달`
    const relaxedSet = buildSet(constraint.max_cards + 1, constraint.max_new_cards + 1, true)
    hold_reason = relaxedSet.some((item) => item.passes_threshold) ? '제약과다' : '임계미달'
  }

  const evidenceTargets = decision === '변경' ? chosen.card_ids : ownedIds
  const evidenceSim = decision === '변경' ? simulate(chosen.card_ids, cards, rules, months) : currentSim
  const evidence: CardEvidence[] = evidenceTargets.map((id) => {
    const card = cards.get(id) as CardProduct
    return buildEvidenceRow(card, rules.get(id), evidenceSim.appliedTier.get(id) ?? null)
  })

  // AC-002 — 결론 카드가 6항목 미달이면 응답을 거부한다
  const incomplete = evidence.filter((row) => !row.complete)
  if (incomplete.length > 0) {
    return {
      ok: false,
      code: 'EVIDENCE_INCOMPLETE',
      reason: `근거 ${EVIDENCE_FIELDS.length}항목 미달: ${incomplete
        .map((row) => `${row.name}(${row.missing.join('·')})`)
        .join(', ')}`,
    }
  }

  return {
    ok: true,
    calculation: {
      fixture_id: profile.fixture_id,
      as_of_date: profile.as_of_date,
      rule_versions: Object.fromEntries(
        evidenceTargets.map((id) => [id, rules.get(id)?.rule_version ?? '']),
      ),
      plan_snapshot: plan.map((item) => ({ ...item })),
      constraint_snapshot: { ...constraint },
      decision,
      hold_reason,
      chosen,
      current,
      // T21 — 유지 결론에서도 검토했던 대안을 손익과 함께 노출한다
      reviewed: (decision === '변경' ? passing.slice(1) : failing).slice(0, 3),
      evidence,
      stale_as_of_warning: monthsBetween(profile.as_of_date, today) > STALE_AS_OF_MONTHS,
      excluded_cards,
      current_card_count: ownedIds.length,
    },
  }
}
