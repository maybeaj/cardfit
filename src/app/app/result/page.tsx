'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CONCLUSION_COPY, DATA_NOTICE, PLAN_NOTICE } from '@/content/copy'
import { won } from '@/domain/format'
import {
  AllocationTable,
  CombinationList,
  ConclusionBanner,
  ReviewedAlternatives,
} from '@/components/result-blocks'
import {
  Actions,
  ErrorNote,
  GhostLink,
  Note,
  PrimaryLink,
  Screen,
  ScreenHeader,
  SecondaryLink,
} from '@/components/shell'
import { logEvent } from '@/state/events'
import { useDemo } from '@/state/store'

/** UI-005 + UI-006 — 기준본 s5. 결론 배너는 좁게, 결제 배분표가 본문 (`T2`). */
export default function ResultScreen() {
  const router = useRouter()
  const { calculation, error, profile, clearError } = useDemo()
  const [scenario, setScenario] = useState('expected')

  useEffect(() => {
    if (!calculation && !error) router.replace('/app/plan')
  }, [calculation, error, router])

  useEffect(() => {
    if (calculation) {
      logEvent('결과열람', {
        decision: calculation.decision,
        net_benefit: calculation.chosen.net_benefit,
      })
    }
  }, [calculation])

  if (error) {
    // AC-001 · AC-002 — 결과를 반환하지 않는 두 경우를 화면에서도 결과처럼 보여주지 않는다
    return (
      <Screen>
        <ScreenHeader
          step="계산 결과"
          title={
            error.code === 'INVALID_PLAN'
              ? '아직 계산할 수 없어요'
              : error.code === 'EVIDENCE_INCOMPLETE'
                ? '근거가 부족해 결과를 보여주지 않았어요'
                : '결과를 만들지 못했어요'
          }
          lead={error.message}
          backHref="/app/plan"
        />
        <div className="mt-3 grid gap-2">
          {error.missing.length > 0 ? (
            <ErrorNote>부족한 항목 — {error.missing.join(' · ')}</ErrorNote>
          ) : null}
          <Note>
            {error.code === 'INVALID_PLAN'
              ? PLAN_NOTICE.emptyBlocked
              : '근거 6항목이 모두 갖춰진 카드만 결론에 넣습니다.'}
          </Note>
        </div>
        <Actions>
          <PrimaryLink href="/app/plan" onClick={clearError}>
            {error.retryable ? '입력으로 돌아가 다시 확인하기' : '입력으로 돌아가기'}
          </PrimaryLink>
        </Actions>
      </Screen>
    )
  }

  if (!calculation) return null
  const shown = calculation.decision === '변경' ? calculation.chosen : calculation.current
  const multiplier =
    CONCLUSION_COPY.scenario.options.find((item) => item.key === scenario)?.multiplier ?? 1

  return (
    <Screen>
      <ScreenHeader step="06 · 계산 결과" title={CONCLUSION_COPY.title} backHref="/app/constraint" />

      <ConclusionBanner calculation={calculation} />

      {/*
        지출 탐색 — 계획이 예상보다 적거나 많을 때 폭이 어느 정도인지 가늠하는 참고값이다.
        계산을 다시 돌리지 않고 확인한 계획의 배수로만 보여주며, 공식 결론은 `예상대로` 기준이다.
      */}
      <div className="scenario-explorer">
        <span className="label">{CONCLUSION_COPY.scenario.label}</span>
        <div className="scenario-tabs" role="group" aria-label="지출 탐색">
          {CONCLUSION_COPY.scenario.options.map((option) => (
            <button
              key={option.key}
              type="button"
              className={scenario === option.key ? 'active' : ''}
              aria-pressed={scenario === option.key}
              onClick={() => setScenario(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="scenario-value">
          {CONCLUSION_COPY.scenario.valueLabel}
          <b className="tabular-nums">
            연 {won(Math.round(shown.net_benefit * multiplier))}
          </b>{' '}
          {CONCLUSION_COPY.scenario.suffix}
        </div>
      </div>

      <Note>
        <b>{CONCLUSION_COPY.baselineTitle}</b>
        <br />
        {calculation.decision === '변경'
          ? CONCLUSION_COPY.change.caption(calculation.current_card_count)
          : CONCLUSION_COPY.hold.caption()}
      </Note>

      <CombinationList calculation={calculation} cards={profile.cards} />
      <AllocationTable candidate={shown} cards={profile.cards} />
      <ReviewedAlternatives reviewed={calculation.reviewed} cards={profile.cards} />

      <p className="footer">{DATA_NOTICE.sampleFootnote}</p>

      <Actions>
        <SecondaryLink href="/app/evidence">{CONCLUSION_COPY.evidenceCta}</SecondaryLink>
        <GhostLink href="/app/plan">{CONCLUSION_COPY.editPlanCta}</GhostLink>
      </Actions>
    </Screen>
  )
}
