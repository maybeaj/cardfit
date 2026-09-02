'use client'

import { useRouter } from 'next/navigation'
import { CONSTRAINT_COPY, PLAN_NOTICE } from '@/content/copy'
import { NET_BENEFIT_FLOOR, NET_BENEFIT_RATIO } from '@/domain/calc'
import { manwon, won } from '@/domain/format'
import { planTotal } from '@/domain/plan'
import { Actions, Note, PrimaryButton, Screen, ScreenHeader } from '@/components/shell'
import { logEvent } from '@/state/events'
import { useDemo } from '@/state/store'

/**
 * UI-003 변경 조건 — 기준본 s4.
 *
 * 컨트롤 모양은 기준본을 따른다 (스테퍼 + 예/아니오). 다만 사용 카드 상한은 2장이다 —
 * 기준본 HTML은 3장까지 올리지만 조합 후보를 2장 넘게 만들지 않는 것이 도메인 규칙이고
 * (`T6`), 기준본은 화면의 기준이지 계산 제약을 바꾸는 근거가 아니다.
 */
const MAX_CARDS_LIMIT = 2
const MIN_CARDS_LIMIT = 1

export default function ConstraintScreen() {
  const router = useRouter()
  const { plan, constraint, updateConstraint } = useDemo()

  const changeMax = (delta: number) => {
    const next = Math.min(MAX_CARDS_LIMIT, Math.max(MIN_CARDS_LIMIT, constraint.max_cards + delta))
    updateConstraint({ max_cards: next })
  }

  const confirm = () => {
    logEvent('계산요청', {
      items: plan.length,
      max_cards: constraint.max_cards,
      allow_new_card: constraint.allow_new_card,
    })
    router.push('/app/calculating')
  }

  return (
    <Screen>
      <ScreenHeader
        step="05 · 계산 조건"
        title={CONSTRAINT_COPY.title}
        lead={CONSTRAINT_COPY.lead}
        backHref="/app/plan"
      />

      <div className="mt-3 grid gap-2.5">
        <div className="rule">
          <div>
            <b>{CONSTRAINT_COPY.maxCardsLabel}</b>
            <small className="sub block">{CONSTRAINT_COPY.maxCardsHint}</small>
          </div>
          <div className="stepper">
            <button
              type="button"
              onClick={() => changeMax(-1)}
              disabled={constraint.max_cards <= MIN_CARDS_LIMIT}
              aria-label="사용 카드 최대 수 줄이기"
            >
              −
            </button>
            <b aria-live="polite" className="tabular-nums">
              {constraint.max_cards}
            </b>
            <button
              type="button"
              onClick={() => changeMax(1)}
              disabled={constraint.max_cards >= MAX_CARDS_LIMIT}
              aria-label="사용 카드 최대 수 늘리기"
            >
              ＋
            </button>
          </div>
        </div>

        <div className="rule">
          <div>
            <b>{CONSTRAINT_COPY.newCardLabel}</b>
            <small className="sub block">{CONSTRAINT_COPY.newCardHint}</small>
          </div>
          <div className="choice-group" role="group" aria-label={CONSTRAINT_COPY.newCardLabel}>
            {[
              { value: true, label: CONSTRAINT_COPY.yes },
              { value: false, label: CONSTRAINT_COPY.no },
            ].map((option) => (
              <button
                key={String(option.value)}
                type="button"
                className={`choice ${constraint.allow_new_card === option.value ? 'active' : ''}`}
                aria-pressed={constraint.allow_new_card === option.value}
                onClick={() => updateConstraint({ allow_new_card: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
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
        <PrimaryButton onClick={confirm}>{PLAN_NOTICE.confirmCta}</PrimaryButton>
      </Actions>
    </Screen>
  )
}
