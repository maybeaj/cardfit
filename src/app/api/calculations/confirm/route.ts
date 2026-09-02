import { NextResponse } from 'next/server'
import type { Constraint, FutureSpendPlan } from '@/domain/types'
import { calculateAction, confirmPlanAction, savePlanAction } from '@/server/actions'

interface ConfirmRequest {
  fixtureId: string
  sessionId: string
  plan: FutureSpendPlan[]
  constraint: Constraint
  candidateKey: string
}

/** 화면 전환과 DB 왕복을 분리하면서 계획·계산·확정 기록은 순서대로 보존한다. */
export async function POST(request: Request) {
  const input = (await request.json()) as ConfirmRequest
  if (!input.fixtureId || !input.sessionId || !input.candidateKey || !Array.isArray(input.plan)) {
    return NextResponse.json({ ok: false, error: 'invalid request' }, { status: 400 })
  }

  const saved = await savePlanAction(input.fixtureId, input.sessionId, input.plan)
  if (!saved.ok) return NextResponse.json(saved, { status: 422 })

  const calculated = await calculateAction(
    input.fixtureId,
    input.sessionId,
    input.plan,
    input.constraint,
  )
  if (!calculated.ok) return NextResponse.json(calculated, { status: 422 })

  const confirmed = await confirmPlanAction(calculated.data.calculationId, input.candidateKey)
  return NextResponse.json(confirmed, { status: confirmed.ok ? 200 : 422 })
}
