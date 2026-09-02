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
  CtaBar,
  Notice,
  Panel,
  PrimaryLink,
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
      <>
        <ScreenHeader
          step={error.code}
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
        <div className="scroll-area flex flex-col gap-3">
          {error.missing.length > 0 ? (
            <Notice tone="warning">부족한 항목 — {error.missing.join(' · ')}</Notice>
          ) : null}
          <Notice>
            {error.code === 'INVALID_PLAN'
              ? PLAN_NOTICE.emptyBlocked
              : '근거 6항목이 모두 갖춰진 카드만 결론에 넣습니다.'}
          </Notice>
        </div>
        <CtaBar>
          <PrimaryLink href="/app/plan" onClick={clearError}>
            {error.retryable ? '입력으로 돌아가 다시 확인하기' : '입력으로 돌아가기'}
          </PrimaryLink>
        </CtaBar>
      </>
    )
  }

  if (!calculation) return null
  const shown = calculation.decision === '변경' ? calculation.chosen : calculation.current

  return (
    <>
      <ScreenHeader
        step="계산 결과"
        title={CONCLUSION_COPY.title}
        backHref="/app/constraint"
      />
      <div className="scroll-area flex flex-col gap-3">
        <ConclusionBanner calculation={calculation} />

        {/*
          지출 탐색 — 계획이 예상보다 적거나 많을 때 폭이 어느 정도인지 가늠하는 참고값이다.
          계산을 다시 돌리지 않고 확인한 계획의 배수로만 보여주며, 공식 결론은 `예상대로` 기준이다.
        */}
        <div className="rounded-[13px] border border-line bg-bg/50 p-3">
          <span className="mb-1.5 block text-[10px] text-subtle">
            {CONCLUSION_COPY.scenario.label}
          </span>
          <div className="flex gap-1.5" role="group" aria-label="지출 탐색">
            {CONCLUSION_COPY.scenario.options.map((option) => (
              <button
                key={option.key}
                type="button"
                aria-pressed={scenario === option.key}
                onClick={() => setScenario(option.key)}
                className={`flex-1 rounded-lg border px-1 py-1.5 text-[11px] ${
                  scenario === option.key
                    ? 'border-primary/50 bg-primary-soft font-extrabold text-primary'
                    : 'border-line bg-surface text-subtle'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 mb-0 text-[11px] text-subtle">
            {CONCLUSION_COPY.scenario.valueLabel}{' '}
            <b className="ml-1 text-[15px] text-ink tabular-nums">
              연{' '}
              {won(
                Math.round(
                  shown.net_benefit *
                    (CONCLUSION_COPY.scenario.options.find((item) => item.key === scenario)
                      ?.multiplier ?? 1),
                ),
              )}
            </b>{' '}
            {CONCLUSION_COPY.scenario.suffix}
          </p>
        </div>

        {calculation.decision === '변경' ? (
          <Panel tone="bg">
            <dl className="m-0 grid grid-cols-3 gap-2">
              <div>
                <dt className="m-0 text-[11px] text-subtle">추가 혜택</dt>
                <dd className="m-0 mt-0.5 text-[14px] font-extrabold text-positive tabular-nums">
                  +{won(calculation.chosen.gross_benefit)}
                </dd>
              </div>
              <div>
                <dt className="m-0 text-[11px] text-subtle">전환비용</dt>
                <dd className="m-0 mt-0.5 text-[14px] font-extrabold text-warning tabular-nums">
                  −{won(calculation.chosen.switching_cost.total)}
                </dd>
              </div>
              <div>
                <dt className="m-0 text-[11px] text-subtle">순혜택</dt>
                <dd className="m-0 mt-0.5 text-[14px] font-extrabold text-ink tabular-nums">
                  {won(calculation.chosen.net_benefit)}
                </dd>
              </div>
            </dl>
          </Panel>
        ) : null}

        <CombinationList calculation={calculation} cards={profile.cards} />
        <AllocationTable candidate={shown} cards={profile.cards} />
        <ReviewedAlternatives reviewed={calculation.reviewed} cards={profile.cards} />

        <p className="m-0 text-[11.5px] leading-relaxed text-subtle">{DATA_NOTICE.sampleFootnote}</p>
      </div>
      <CtaBar>
        <div className="flex flex-col gap-2">
          <PrimaryLink href="/app/evidence">{CONCLUSION_COPY.evidenceCta}</PrimaryLink>
          <SecondaryLink href="/app/plan">{CONCLUSION_COPY.editPlanCta}</SecondaryLink>
        </div>
      </CtaBar>
    </>
  )
}
