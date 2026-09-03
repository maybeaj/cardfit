import { NextResponse } from 'next/server'
import { calculatePlan } from '@/domain/calc'
import type { CalculationResult, Constraint, FutureSpendPlan } from '@/domain/types'
import { loadProfile } from '@/server/repository'

export const dynamic = 'force-dynamic'

interface SpendInput {
  id?: string
  label: string
  amount: number
  spendingMonths?: number
  category?: string
}

interface CalculateRequest {
  fixtureId?: string
  spends: SpendInput[]
  maxCards?: number
  includeNew?: boolean
  selectedScenario?: 'expected' | 'low' | 'high'
}

const cardArtMap: Record<string, string> = {
  card_01: '/assets/shinhan-mrlife.png',
  'shinhan-deep-dream': '/assets/shinhan-mrlife.png',
  'shinhan-mrlife': '/assets/shinhan-mrlife.png',
  card_02: '/assets/samsung-taptap-o.png',
  'samsung-taptap': '/assets/samsung-taptap-o.png',
  'samsung-taptap-o': '/assets/samsung-taptap-o.png',
  card_03: '/assets/shinhan-deepoil.gif',
  'shinhan-deepoil': '/assets/shinhan-deepoil.gif',
  'lotte-loca': '/assets/samsung-taptap-o.png',
  'woori-every': '/assets/shinhan-mrlife.png',
  'hyundai-zero': '/assets/samsung-taptap-o.png',
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CalculateRequest
    const fixtureId = body.fixtureId || 'mydata_csv'
    const spends = body.spends || []
    const maxCards = Math.min(3, Math.max(1, body.maxCards ?? 2))
    const allowNew = body.includeNew ?? true

    const loaded = await loadProfile(fixtureId)
    let profile = loaded.ok ? loaded.data : null
    if (!profile) {
      const fallback = await loadProfile('change_case')
      if (fallback.ok) {
        profile = fallback.data
      }
    }
    if (!profile) {
      return NextResponse.json({ ok: false, error: 'Failed to load profile for calculation' }, { status: 500 })
    }

    const constraint: Constraint = {
      max_cards: maxCards,
      allow_new_card: allowNew,
      max_new_cards: 1,
    }

    const buildPlanForMultiplier = (mult: number): FutureSpendPlan[] =>
      spends.map((item, idx) => ({
        plan_id: item.id || `spend_${idx}`,
        category: item.category || item.label,
        amount: Math.round(item.amount * mult),
        direction: 'increase',
        month_offset: Math.min(12, Math.max(1, item.spendingMonths || 1)),
        source: 'user',
      }))

    // Build calculations for 3 scenarios
    const expectedPlan = buildPlanForMultiplier(1.0)
    const lowPlan = buildPlanForMultiplier(0.8)
    const highPlan = buildPlanForMultiplier(1.2)

    const expectedRes = calculatePlan({ profile, plan: expectedPlan, constraint })
    const lowRes = calculatePlan({ profile, plan: lowPlan, constraint })
    const highRes = calculatePlan({ profile, plan: highPlan, constraint })

    if (!expectedRes.ok) {
      return NextResponse.json({ ok: false, error: expectedRes.reason }, { status: 422 })
    }

    const formatScenario = (res: CalculationResult, multiplier: number) => {
      if (!res.ok) {
        return {
          multiplier,
          pass: false,
          benefitIncrease: 0,
          displayBenefit: 0,
          annualFee: 0,
          cards: [],
          allocations: [],
        }
      }
      const calc = res.calculation
      const chosen = calc.chosen
      const pass = calc.decision === '변경' && chosen.passes_threshold

      const cards = profile.cards.map((card) => {
        const status = chosen.statuses[card.card_id] || (card.owned ? '정리' : '제외')
        const allocated = chosen.allocations
          .filter((a) => a.card_id === card.card_id)
          .reduce((sum, a) => sum + a.amount, 0)
        const benefit = chosen.allocations
          .filter((a) => a.card_id === card.card_id)
          .reduce((sum, a) => sum + a.benefit, 0)

        return {
          cardId: card.card_id,
          name: card.name,
          issuer: card.issuer,
          status,
          annualFee: card.annual_fee,
          allocatedAmount: allocated,
          projectedBenefit: benefit,
          cardArtUrl: cardArtMap[card.card_id] || '/assets/shinhan-mrlife.png',
        }
      }).filter((c) => c.status === '신규' || c.status === '유지' || (c.status === '정리' && pass))

      return {
        multiplier,
        pass,
        benefitIncrease: chosen.net_benefit,
        displayBenefit: chosen.gross_benefit_absolute,
        annualFee: chosen.switching_cost.annual_fee,
        cards,
        allocations: chosen.allocations.map((a) => {
          const card = profile.cards.find((c) => c.card_id === a.card_id)
          return {
            category: a.category,
            amount: a.amount,
            benefit: a.benefit,
            cardId: a.card_id,
            cardName: card?.name || a.card_id,
            cardArtUrl: cardArtMap[a.card_id] || '/assets/shinhan-mrlife.png',
          }
        }),
      }
    }

    const calcData = expectedRes.calculation

    return NextResponse.json({
      ok: true,
      data: {
        decision: calcData.decision,
        baselineBenefit: calcData.current.gross_benefit_absolute,
        currentCardCount: calcData.current_card_count,
        scenarios: {
          low: formatScenario(lowRes, 0.8),
          expected: formatScenario(expectedRes, 1.0),
          high: formatScenario(highRes, 1.2),
        },
      },
    })
  } catch (error) {
    console.error('Calculation API error:', error)
    return NextResponse.json({ ok: false, error: 'Calculation failed' }, { status: 500 })
  }
}
