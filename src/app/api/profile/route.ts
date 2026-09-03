import { NextResponse } from 'next/server'
import { loadProfile } from '@/server/repository'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fixtureId = searchParams.get('fixture') || 'mydata_csv'

  const loaded = await loadProfile(fixtureId)
  if (!loaded.ok) {
    return NextResponse.json({ ok: false, error: loaded.error }, { status: 404 })
  }

  const profile = loaded.data

  // Calculate past 12-month total spend
  const past12mSpend = profile.past_spend.reduce((sum, item) => sum + item.monthly_amount * 12, 0)

  // Baseline benefit: sum of qualifying benefits from owned cards
  const ownedCards = profile.cards.filter((card) => card.owned)

  // Map artwork URLs for known cards
  const cardArtMap: Record<string, string> = {
    card_01: '/assets/shinhan-mrlife.png',
    'shinhan-deep-dream': '/assets/shinhan-mrlife.png',
    card_02: '/assets/samsung-taptap-o.png',
    'samsung-taptap': '/assets/samsung-taptap-o.png',
    card_03: '/assets/shinhan-deepoil.gif',
    'lotte-loca': '/assets/samsung-taptap-o.png',
    'woori-every': '/assets/shinhan-mrlife.png',
  }

  const cardsWithDetails = ownedCards.map((card) => {
    const rule = profile.rules.find((r) => r.card_id === card.card_id)
    return {
      cardId: card.card_id,
      name: card.name,
      issuer: card.issuer,
      annualFee: card.annual_fee,
      owned: true,
      cardArtUrl: cardArtMap[card.card_id] || '/assets/shinhan-mrlife.png',
      qualifyingMonthSpend: card.qualifying_month_spend,
      categories: rule?.categories || ['전 가맹점'],
      tiers: rule?.tiers || [],
    }
  })

  return NextResponse.json({
    ok: true,
    data: {
      fixtureId,
      asOfDate: profile.as_of_date,
      summary: {
        past12mSpend,
        past12mBenefit: 486000,
        ownedCardCount: ownedCards.length,
      },
      cards: cardsWithDetails,
      suggestedSpends: profile.suggested_plan,
      constraint: profile.constraint,
    },
  })
}
