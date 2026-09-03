import { NextResponse } from 'next/server'
import { startSessionAction } from '@/server/actions'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      fixtureId?: string
      sessionId?: string
    }

    const fixtureId = body.fixtureId || 'mydata_csv'
    const sessionId = body.sessionId || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

    const started = await startSessionAction(fixtureId, sessionId)
    if (!started.ok) {
      return NextResponse.json({ ok: false, error: started.error }, { status: 422 })
    }

    return NextResponse.json({
      ok: true,
      data: {
        sessionId,
        fixtureId,
        profile: started.data.profile,
      },
    })
  } catch (error) {
    console.error('Session start error:', error)
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
