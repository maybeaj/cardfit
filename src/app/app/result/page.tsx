'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CONCLUSION_COPY, DATA_NOTICE, PLAN_NOTICE } from '@/content/copy'
import { calculatePlan } from '@/domain/calc'
import type { Calculation } from '@/domain/types'
import { EvidenceSheet } from '@/components/evidence-sheet'
import { BenefitSummary } from '@/features/cardfit/result/benefit-summary'
import { CardRoleList } from '@/features/cardfit/result/card-role-list'
import { PaymentAllocation } from '@/features/cardfit/result/payment-allocation'
import { ResultActions } from '@/features/cardfit/result/result-actions'
import { ReviewedAlternatives } from '@/features/cardfit/result/reviewed-alternatives'
import { ScenarioTabs } from '@/features/cardfit/result/scenario-tabs'
import {
  Actions,
  ErrorNote,
  Note,
  PrimaryLink,
  Screen,
  ScreenHeader,
} from '@/components/shell'
import { logEvent } from '@/state/events'
import { useDemo } from '@/state/store'

/** UI-005 + UI-006 — 기준본 s5. 결론 배너는 좁게, 결제 배분표가 본문 (`T2`). */
export default function ResultScreen() {
  const router = useRouter()
  const { calculation, error, profile, plan, constraint, clearError, confirmCombination } =
    useDemo()
  const [scenario, setScenario] = useState('expected')
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [liked, setLiked] = useState(false)

  /*
   * 시나리오별 결과를 규칙 엔진으로 다시 계산한다.
   * 출력값에 배수를 곱하지 않는 이유 — 실적구간·혜택한도·연회비는 금액에 비례하지 않아
   * 곱셈으로는 틀린 금액이 나온다. 계획을 바꿔 엔진을 다시 돌려야 맞는 값이 된다.
   *
   * 엔진은 순수 함수라 같은 입력에 항상 같은 결과를 준다 (NFR-001). 서버를 다시 부르지 않아도
   * 서버가 계산한 값과 어긋나지 않는다.
   */
  const scenarios = useMemo(() => {
    const out: Record<string, Calculation | null> = {}
    for (const option of CONCLUSION_COPY.scenario.options) {
      if (option.multiplier === 1) {
        // `예상대로`는 사용자가 확인한 계획 그대로다. 서버가 계산한 결과를 그대로 쓴다
        out[option.key] = calculation
        continue
      }
      const scaled = plan.map((item) => ({
        ...item,
        amount: Math.round(item.amount * option.multiplier),
      }))
      const result = calculatePlan({ profile, plan: scaled, constraint })
      out[option.key] = result.ok ? result.calculation : null
    }
    return out
  }, [calculation, plan, constraint, profile])


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

  const scenarioOption =
    CONCLUSION_COPY.scenario.options.find((item) => item.key === scenario) ??
    CONCLUSION_COPY.scenario.options[1]!
  // 시나리오 계산이 결과를 못 만들면(예: 근거 미달) 확인한 계획 결과로 되돌린다
  const shownCalculation = scenarios[scenario] ?? calculation
  const shown =
    shownCalculation.decision === '변경' ? shownCalculation.chosen : shownCalculation.current
  /*
   * 종착 행동 — 북극성(조합안 선택률)의 측정 지점이다 (`T12`).
   * 고른 시점의 규칙 버전·기준일·금액을 함께 얼린다 (`T43`).
   */
  const likeCombination = () => {
    setLiked(true)
    confirmCombination()
    logEvent('조합좋아요', {
      candidate_id: shown.candidate_id,
      decision: shownCalculation.decision,
      scenario,
    })
    try {
      window.localStorage.setItem(
        'cardfit.liked-combination',
        JSON.stringify({
          candidate_id: shown.candidate_id,
          scenario,
          saved_at: new Date().toISOString(),
        }),
      )
    } catch {
      // 로컬 저장 실패가 결과 확인 흐름을 막지 않는다.
    }
  }

  return (
    <Screen>
      <ScreenHeader title={CONCLUSION_COPY.title} backHref="/app/constraint" />

      <div className="result-shell">
        <ScenarioTabs selected={scenario} onSelect={setScenario} />
        <BenefitSummary
          calculation={shownCalculation}
          scenarioLabel={scenarioOption.label}
          onOpenEvidence={() => setEvidenceOpen(true)}
        />
      </div>

      {/* 어떤 가정의 결과인지 밝힌다 — 시나리오를 바꾸면 결론이 뒤집힐 수 있다 */}
      {scenario === 'expected' ? null : (
        <p className="footer">{CONCLUSION_COPY.scenario.assumption(scenarioOption.label)}</p>
      )}

      <Note>
        <b>{CONCLUSION_COPY.baselineTitle}</b>
        <br />
        {shownCalculation.decision === '변경'
          ? CONCLUSION_COPY.change.caption(shownCalculation.current_card_count)
          : CONCLUSION_COPY.hold.caption()}
      </Note>

      <CardRoleList calculation={shownCalculation} cards={profile.cards} />
      <PaymentAllocation candidate={shown} cards={profile.cards} />
      <ReviewedAlternatives reviewed={shownCalculation.reviewed} cards={profile.cards} />

      <p className="footer">{DATA_NOTICE.sampleFootnote}</p>

      <ResultActions liked={liked} onLike={likeCombination} />

      <EvidenceSheet
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        calculation={shownCalculation}
        profile={profile}
        scenarioLabel={scenarioOption.label}
      />
    </Screen>
  )
}
