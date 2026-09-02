'use client'

import { useRouter } from 'next/navigation'
import { CONSTRAINT_COPY, PLAN_NOTICE } from '@/content/copy'
import { NET_BENEFIT_FLOOR, NET_BENEFIT_RATIO } from '@/domain/calc'
import { manwon, won } from '@/domain/format'
import { planTotal } from '@/domain/plan'
import { CtaBar, Notice, Panel, PrimaryButton, ScreenHeader } from '@/components/shell'
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
    <>
      <ScreenHeader
        step="계산 조건"
        title={CONSTRAINT_COPY.title}
        lead={CONSTRAINT_COPY.lead}
        backHref="/app/plan"
      />
      <div className="scroll-area flex flex-col gap-2.5">
        <Panel>
          <div className="flex min-h-[58px] items-center justify-between gap-2.5">
            <div>
              <b className="block text-[12px] text-ink">{CONSTRAINT_COPY.maxCardsLabel}</b>
              <small className="text-[10px] text-subtle">{CONSTRAINT_COPY.maxCardsHint}</small>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => changeMax(-1)}
                disabled={constraint.max_cards <= MIN_CARDS_LIMIT}
                aria-label="사용 카드 최대 수 줄이기"
                className="h-7 w-7 rounded-lg bg-primary-soft text-[15px] font-black text-primary disabled:opacity-40"
              >
                −
              </button>
              <b aria-live="polite" className="text-[15px] text-ink tabular-nums">
                {constraint.max_cards}
              </b>
              <button
                type="button"
                onClick={() => changeMax(1)}
                disabled={constraint.max_cards >= MAX_CARDS_LIMIT}
                aria-label="사용 카드 최대 수 늘리기"
                className="h-7 w-7 rounded-lg bg-primary-soft text-[15px] font-black text-primary disabled:opacity-40"
              >
                ＋
              </button>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="flex min-h-[58px] items-center justify-between gap-2.5">
            <div>
              <b className="block text-[12px] text-ink">{CONSTRAINT_COPY.newCardLabel}</b>
              <small className="text-[10px] text-subtle">{CONSTRAINT_COPY.newCardHint}</small>
            </div>
            <div
              role="group"
              aria-label={CONSTRAINT_COPY.newCardLabel}
              className="flex flex-none overflow-hidden rounded-[9px] border border-line"
            >
              {[
                { value: true, label: CONSTRAINT_COPY.yes },
                { value: false, label: CONSTRAINT_COPY.no },
              ].map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  aria-pressed={constraint.allow_new_card === option.value}
                  onClick={() => updateConstraint({ allow_new_card: option.value })}
                  className={`min-w-[42px] px-2.5 py-1.5 text-[11px] ${
                    constraint.allow_new_card === option.value
                      ? 'bg-primary text-white'
                      : 'bg-surface text-subtle'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </Panel>

        <Panel tone="bg">
          <p className="m-0 text-[11px] text-subtle">확인할 앞으로 12개월 계획</p>
          <p className="mt-1 mb-0 text-[17px] font-extrabold text-ink tabular-nums">
            {plan.length}건 · 순증 {manwon(planTotal(plan))}
          </p>
        </Panel>

        <Notice tone="info">
          {CONSTRAINT_COPY.gate(won(NET_BENEFIT_FLOOR), Math.round(NET_BENEFIT_RATIO * 100))}
        </Notice>
        <Notice>{CONSTRAINT_COPY.confirmNote}</Notice>
      </div>
      <CtaBar>
        <PrimaryButton onClick={confirm}>{PLAN_NOTICE.confirmCta}</PrimaryButton>
      </CtaBar>
    </>
  )
}
