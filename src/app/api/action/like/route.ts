import { NextResponse } from 'next/server'
import { confirmPlanAction } from '@/server/actions'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      calculationId?: string
      candidateKey?: string
      chosenCardIds?: string[]
    }

    if (body.calculationId && body.candidateKey) {
      const confirmed = await confirmPlanAction(body.calculationId, body.candidateKey)
      if (!confirmed.ok) {
        return NextResponse.json(confirmed, { status: 422 })
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        message: '좋아요를 반영했어요',
        nextActions: [
          { label: '신규 카드 발급 신청', detail: '카드사 공식 페이지로 연결' },
          { label: '지출 목표 알림 받기', detail: '실적 달성 시점 알림' },
        ],
      },
    })
  } catch (error) {
    console.error('Like action error:', error)
    return NextResponse.json({ ok: false, error: 'Failed to record action' }, { status: 500 })
  }
}
