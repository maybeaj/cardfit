import 'server-only'
import type {
  BenefitRule,
  CardProduct,
  FutureSpendPlan,
  PastSpend,
  Profile,
} from '@/domain/types'
import { HORIZON_MONTHS } from '@/domain/plan'
import { prisma } from './prisma'
import { actionError, type ActionResult } from './errors'

/**
 * TEC-06 — Prisma 접근을 서버 전용 Repository로 격리한다.
 * 계산 엔진(`src/domain`)과 화면은 DB를 알지 못하고 `Profile`만 받는다.
 *
 * 실연동 전환 지점은 이 파일 하나다 (ADR-001).
 */

const iso = (date: Date) => date.toISOString().slice(0, 10)

/** DB 키(`fixtureId:cardId`)를 도메인 카드 ID로 되돌린다 */
const bareCardId = (id: string) => id.split(':').slice(1).join(':') || id

export async function loadProfile(fixtureId: string): Promise<ActionResult<Profile>> {
  const fixture = await prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: {
      constraint: true,
      suggestions: { orderBy: { id: 'asc' } },
      cards: {
        orderBy: { id: 'asc' },
        include: { rule: { include: { tiers: { orderBy: { minMonthlySpend: 'asc' } }, unmodeled: { orderBy: { label: 'asc' } } } } },
      },
    },
  })

  if (!fixture || fixture.cards.length === 0) {
    return { ok: false, error: actionError('FIXTURE_UNAVAILABLE', [fixtureId]) }
  }
  if (!fixture.constraint) {
    return { ok: false, error: actionError('FIXTURE_INVALID', ['constraint']) }
  }

  // 기준일·규칙 버전이 없는 Fixture로는 계산하지 않는다
  const missingMeta: string[] = []
  for (const card of fixture.cards) {
    if (!card.rule) missingMeta.push(`${card.name}: 혜택 규칙`)
    else if (!card.rule.ruleVersion) missingMeta.push(`${card.name}: rule_version`)
  }
  if (missingMeta.length > 0) {
    return { ok: false, error: actionError('FIXTURE_INVALID', missingMeta) }
  }

  const cards: CardProduct[] = fixture.cards.map((card) => ({
    card_id: bareCardId(card.id),
    issuer: card.issuer,
    name: card.name,
    annual_fee: card.annualFee,
    official_url: card.officialUrl,
    owned: card.owned,
    qualifying_month_spend: card.qualifyingMonthSpend,
    transition: {
      requalification_loss: card.requalificationLoss,
      issuance_wait_cost: card.issuanceWaitCost,
      source: { label: card.transitionSourceLabel, as_of_date: iso(card.transitionSourceDate) },
    },
  }))

  const rules: BenefitRule[] = fixture.cards
    .filter((card) => card.rule)
    .map((card) => {
      const rule = card.rule!
      return {
        card_id: bareCardId(card.id),
        rule_version: rule.ruleVersion,
        as_of_date: iso(rule.asOfDate),
        effective_from: iso(rule.effectiveFrom),
        effective_to: iso(rule.effectiveTo),
        categories: rule.categories,
        tiers: rule.tiers.map((tier) => ({
          min_monthly_spend: tier.minMonthlySpend,
          rate: tier.rate,
          monthly_cap: tier.monthlyCap,
        })),
        excluded: rule.excluded,
        unmodeled: rule.unmodeled.map((item) => ({
          label: item.label,
          bound: item.bound,
          source: { label: item.sourceLabel, as_of_date: iso(item.sourceDate) },
        })),
      }
    })

  // 거래 단위 과거 소비를 카테고리별 월평균으로 되돌린다.
  // Seed가 각 달의 카테고리 합을 월평균과 같게 넣으므로 나눗셈이 무손실이다.
  const grouped = await prisma.pastSpend.groupBy({
    by: ['category'],
    where: { fixtureId },
    _sum: { amount: true },
  })
  const past_spend: PastSpend[] = grouped
    .map((row) => ({
      category: row.category,
      monthly_amount: Math.round((row._sum.amount ?? 0) / HORIZON_MONTHS),
    }))
    .sort((a, b) => b.monthly_amount - a.monthly_amount || a.category.localeCompare(b.category, 'ko'))

  const suggested_plan: FutureSpendPlan[] = fixture.suggestions.map((item) => ({
    plan_id: item.id.split(':').slice(1).join(':') || item.id,
    category: item.category,
    amount: item.amount,
    direction: item.direction === 'INCREASE' ? 'increase' : 'decrease',
    month_offset: item.monthOffset,
    source: 'suggested',
  }))

  return {
    ok: true,
    data: {
      fixture_id: fixture.id,
      as_of_date: iso(fixture.asOfDate),
      cards,
      rules,
      past_spend,
      suggested_plan,
      constraint: {
        max_cards: fixture.constraint.maxCards,
        allow_new_card: fixture.constraint.allowNewCard,
        max_new_cards: fixture.constraint.maxNewCards,
      },
    },
  }
}
