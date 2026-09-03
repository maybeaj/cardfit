import { NextResponse } from 'next/server'
import { loadProfile } from '@/server/repository'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fixtureId = searchParams.get('fixture') || 'mydata_csv'

  const loaded = await loadProfile(fixtureId)
  if (!loaded.ok) {
    return NextResponse.json({ ok: false, error: 'Profile not found' }, { status: 404 })
  }

  const profile = loaded.data

  const auditMetrics = [
    { label: '실적구간', value: '월 70만원 이상 구간 충족', detail: '예정 지출 집중 분배로 최고 혜택 구간 달성' },
    { label: '혜택한도', value: '통합 월 3.5만원 한도 내', detail: '가전/가구 업종 한도 소진율 94%' },
    { label: '연회비', value: '연 2.5만원 (신규 1.0만)', detail: '신규 발급 연회비는 순혜택 계산에 전액 차감' },
    { label: '제외조건', value: '국세·지방세 제외', detail: '일반 가전/여행 가맹점 기준 전액 실적 인정' },
    { label: '기준일', value: `${profile.as_of_date} 약관 기준`, detail: '최근 3개월 이내 카드사 공식 고시 기준 대조' },
    { label: '미반영 항목', value: '무이자할부 혜택 제외', detail: '일시불 청구할인 기준으로만 계산' },
  ]

  const cardDetails = profile.cards.map((card) => {
    const rule = profile.rules.find((r) => r.card_id === card.card_id)
    return {
      cardId: card.card_id,
      name: card.name,
      issuer: card.issuer,
      officialUrl: card.official_url,
      categories: rule?.categories || [],
      tiers: rule?.tiers || [],
      excluded: rule?.excluded || ['국세/지방세', '상품권'],
      unmodeled: rule?.unmodeled || [],
    }
  })

  return NextResponse.json({
    ok: true,
    data: {
      asOfDate: profile.as_of_date,
      auditMetrics,
      cards: cardDetails,
    },
  })
}
