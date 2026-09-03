'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CALC_NOTICE, DATA_NOTICE, EVIDENCE_COPY } from '@/content/copy'
import { EvidenceDetails } from '@/components/evidence-details'
import {
  Actions,
  GhostLink,
  Note,
  Notice,
  PrimaryButton,
  Screen,
  ScreenHeader,
} from '@/components/shell'
import { logEvent } from '@/state/events'
import { useDemo } from '@/state/store'

/**
 * UI-007 근거 — 기준본 s6. 결론 화면에서만 진입한다. 6항목 + 미반영 항목.
 * 전문 용어를 바꾸지 않고 괄호 한 줄 풀이만 붙인다 (`T44`).
 */
export default function EvidenceScreen() {
  const router = useRouter()
  const { calculation, error, pending, profile } = useDemo()

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

  // 근거를 다 본 뒤 다음 행동으로 넘어간다. 선택 자체는 결과 화면의 `좋아요`가 맡는다 (`T12`)
  const goNext = () => router.push('/app/confirm')

  return (
    <Screen>
      <ScreenHeader
        title={EVIDENCE_COPY.title}
        lead={EVIDENCE_COPY.lead}
        backHref="/app/result"
      />

      {calculation.stale_as_of_warning ? <Notice>{EVIDENCE_COPY.staleAsOf}</Notice> : null}

      <EvidenceDetails calculation={calculation} profile={profile} candidate={shown} />

      {calculation.excluded_cards.length > 0 ? (
        <div className="mt-3 rounded-xl bg-[var(--color-bg)] p-2.5">
          <b className="text-[10px]">{EVIDENCE_COPY.excludedTitle}</b>
          <ul className="mt-1.5 mb-0 list-none p-0">
            {calculation.excluded_cards.map((item) => (
              <li key={item.card_id} className="text-[9px] text-[var(--color-subtle)]">
                · {item.card_id} — {item.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Notice>{EVIDENCE_COPY.notice}</Notice>
      <Note>{EVIDENCE_COPY.qualifyingModel}</Note>
      <Note>{CALC_NOTICE.engine}</Note>
      <p className="footer">
        {EVIDENCE_COPY.disclaimer} · {DATA_NOTICE.sampleFootnote}
      </p>

      <Actions>
        <PrimaryButton onClick={goNext} disabled={pending}>
          {EVIDENCE_COPY.applyCta}
        </PrimaryButton>
        <GhostLink href="/app/result">{EVIDENCE_COPY.backToResult}</GhostLink>
      </Actions>
    </Screen>
  )
}
