'use client'

import { useRouter } from 'next/navigation'
import { CONSTRAINT_COPY, PLAN_NOTICE } from '@/content/cardfit-copy'
import { manwon, won } from '@/domain/cardfit/format'
import { planTotal } from '@/domain/cardfit/plan'
import { NET_BENEFIT_FLOOR, NET_BENEFIT_RATIO } from '@/domain/cardfit/constants'
import { CardCountStepper } from '@/features/cardfit/constraint/card-count-stepper'
import { NewCardChoice } from '@/features/cardfit/constraint/new-card-choice'
import { Actions, Note, PrimaryButton, Screen, ScreenHeader } from '@/components/shell'
import { logEvent } from '@/state/client-events'
import { useDemo } from '@/state/store'

/**
 * UI-003 변경 조건 — 기준본 s4.
 *
 * 컨트롤 모양과 상한 모두 기준본을 따른다 — 스테퍼로 1~3장을 고르고 신규는 예/아니오다 (`T11`).
 * 기본값은 2장이다.
 */
export default function ConstraintScreen() {
  const router = useRouter()
  const { plan, constraint, pending, updateConstraint, requestCalculation } = useDemo()

  /*
   * 계산하고 결과로 바로 간다. 중간에 대기 화면을 두지 않는 이유 —
   * 규칙 엔진이 동기 함수라 기다릴 것이 없고, 없는 지연을 연출하면
   * 사용자가 그만큼 더 기다리게 된다.
   */
  const confirm = () => {
    logEvent('계산요청', {
      items: plan.length,
      max_cards: constraint.max_cards,
      allow_new_card: constraint.allow_new_card,
    })
    /*
     * 계산이 끝난 뒤에 옮긴다. 먼저 옮기면 결과 화면이 빈 상태로 열려 입력으로 되튕긴다 —
     * 금액을 만드는 곳이 서버라 결과가 즉시 있지 않다.
     */
    void requestCalculation().then(() => router.push('/app/result'))
  }

  return (
    <Screen>
      <ScreenHeader
        title={CONSTRAINT_COPY.title}
        backHref="/app/plan"
      />

      <div className="mt-3 grid gap-2.5">
        <CardCountStepper
          value={constraint.max_cards}
          onChange={(max_cards) => updateConstraint({ max_cards })}
        />
        <NewCardChoice
          value={constraint.allow_new_card}
          onChange={(allow_new_card) => updateConstraint({ allow_new_card })}
        />
      </div>

      <div className="total">
        <span>확인할 앞으로 12개월 계획</span>
        <span className="tabular-nums">
          {plan.length}건 · 순증 {manwon(planTotal(plan))}
        </span>
      </div>

      <Note>{CONSTRAINT_COPY.gate(won(NET_BENEFIT_FLOOR), Math.round(NET_BENEFIT_RATIO * 100))}</Note>
      <p className="footer">{CONSTRAINT_COPY.confirmNote}</p>

      <Actions>
        <PrimaryButton onClick={confirm} disabled={pending}>
          {pending ? PLAN_NOTICE.calculating : PLAN_NOTICE.confirmCta}
        </PrimaryButton>
      </Actions>
    </Screen>
  )
}
