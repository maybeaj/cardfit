'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DATA_NOTICE, PLAN_NOTICE } from '@/content/copy'
import { won } from '@/domain/format'
import {
  AllocationTable,
  CombinationList,
  ConclusionBanner,
  ReviewedAlternatives,
} from '@/components/result-blocks'
import { CtaBar, Notice, Panel, PrimaryLink, ScreenHeader } from '@/components/ui'
import { logEvent } from '@/state/events'
import { useDemo } from '@/state/store'

/** UI-005 + UI-006 — 결론 배너는 좁게, 결제 배분표가 본문 (T2). */
export default function ResultScreen() {
  const router = useRouter()
  const { result, planConfirmed, profile } = useDemo()

  useEffect(() => {
    if (!planConfirmed) router.replace('/app/plan')
  }, [planConfirmed, router])

  useEffect(() => {
    if (result?.ok) {
      logEvent('결과열람', {
        decision: result.calculation.decision,
        net_benefit: result.calculation.chosen.net_benefit,
      })
    }
  }, [result])

  if (!result) return null

  if (!result.ok) {
    // AC-001 · AC-002 — 결과를 반환하지 않는 두 경우를 화면에서도 결과처럼 보여주지 않는다
    return (
      <>
        <ScreenHeader
          step="결과 없음"
          title={
            result.code === 'EMPTY_PLAN'
              ? '아직 계산할 수 없어요'
              : '근거가 부족해 결과를 보여주지 않았어요'
          }
          lead={result.reason}
          backHref="/app/plan"
        />
        <div className="scroll-area">
          <Notice tone="warning">
            {result.code === 'EMPTY_PLAN' ? PLAN_NOTICE.emptyBlocked : '근거 6항목이 모두 갖춰진 카드만 결론에 넣습니다.'}
          </Notice>
        </div>
        <CtaBar>
          <PrimaryLink href="/app/plan">입력으로 돌아가기</PrimaryLink>
        </CtaBar>
      </>
    )
  }

  const calculation = result.calculation
  const shown = calculation.decision === '변경' ? calculation.chosen : calculation.current

  return (
    <>
      <ScreenHeader
        step={calculation.decision === '변경' ? '조합 변경 제안' : '현재 조합 유지'}
        title={calculation.decision === '변경' ? '이 조합을 권합니다' : '지금 조합을 그대로 쓰세요'}
        backHref="/app/constraint"
      />
      <div className="scroll-area flex flex-col gap-3">
        <ConclusionBanner calculation={calculation} />

        {calculation.decision === '변경' ? (
          <Panel tone="bg">
            <dl className="m-0 grid grid-cols-3 gap-2">
              <div>
                <dt className="m-0 text-[11px] text-muted">추가 혜택</dt>
                <dd className="m-0 mt-0.5 text-[14px] font-extrabold text-positive tabular-nums">
                  +{won(calculation.chosen.gross_benefit)}
                </dd>
              </div>
              <div>
                <dt className="m-0 text-[11px] text-muted">전환비용</dt>
                <dd className="m-0 mt-0.5 text-[14px] font-extrabold text-warning tabular-nums">
                  −{won(calculation.chosen.switching_cost.total)}
                </dd>
              </div>
              <div>
                <dt className="m-0 text-[11px] text-muted">순혜택</dt>
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

        <Link href="/app/plan" className="text-center text-[13px] font-semibold text-primary">
          계획을 수정하고 다시 계산하기
        </Link>
        <p className="m-0 text-[11.5px] leading-relaxed text-muted">{DATA_NOTICE.sampleFootnote}</p>
      </div>
      <CtaBar>
        <PrimaryLink href="/app/evidence">왜 이런 결과인지 보기</PrimaryLink>
      </CtaBar>
    </>
  )
}
