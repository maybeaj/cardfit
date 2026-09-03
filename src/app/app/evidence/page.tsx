'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CALC_NOTICE, DATA_NOTICE, EVIDENCE_COPY } from '@/content/cardfit-copy'
import { EvidenceDetails } from '@/features/cardfit/result/evidence-details'
import {
  Actions,
  Note,
  Notice,
  GhostLink,
  Screen,
  ScreenHeader,
} from '@/components/shell'
import { logEvent } from '@/state/client-events'
import { useDemo } from '@/state/store'

/**
 * UI-007 근거 — 기준본 s6. 결론 화면에서만 진입한다. 6항목 + 미반영 항목.
 * 전문 용어를 바꾸지 않고 괄호 한 줄 풀이만 붙인다 (`T44`).
 */
export default function EvidenceScreen() {
  const router = useRouter()
  const { calculation, error, profile } = useDemo()

  useEffect(() => {
    if (error) {
      router.replace('/app/result')
      return
    }
    if (!calculation) router.replace('/app/plan')
  }, [calculation, error, router])

  useEffect(() => {
    if (calculation) logEvent('근거열람', { cards: calculation.evidence.length })
  }, [calculation])

  if (!calculation) return null

  const shown = calculation.decision === '변경' ? calculation.chosen : calculation.current

  return (
    <Screen>
      <ScreenHeader
        title={EVIDENCE_COPY.title}
        lead={EVIDENCE_COPY.lead}
        backHref="/app/result"
      />

      {calculation.stale_as_of_warning ? <Notice>{EVIDENCE_COPY.staleAsOf}</Notice> : null}

      <EvidenceDetails calculation={calculation} profile={profile} candidate={shown} />

      {/* 6항목 미달로 후보에서 뺀 카드와 사유 (`T41`) — 조용히 감추지 않는다 */}
      {calculation.excluded_cards.length > 0 ? (
        <div className="spend-evidence">
          <h3>{EVIDENCE_COPY.excludedTitle}</h3>
          {calculation.excluded_cards.map((item) => (
            <div key={item.card_id} className="spend-evidence-row">
              <b>{item.card_id}</b>
              <span>{item.reason}</span>
            </div>
          ))}
        </div>
      ) : null}

      <Notice>{EVIDENCE_COPY.notice}</Notice>
      <Note>{EVIDENCE_COPY.qualifyingModel}</Note>
      <Note>{CALC_NOTICE.engine}</Note>
      <p className="footer">
        {EVIDENCE_COPY.disclaimer} · {DATA_NOTICE.sampleFootnote}
      </p>

      {/*
        여기서 끝내지 않는다 — 종착 행동은 결과 화면의 `이 조합 선택하기`다 (`T12` · UI-008).
        근거는 확인하러 들어왔다 돌아가는 곳이라 나가는 문 하나만 둔다.
      */}
      <Actions>
        <GhostLink href="/app/result">{EVIDENCE_COPY.backToResult}</GhostLink>
      </Actions>
    </Screen>
  )
}
