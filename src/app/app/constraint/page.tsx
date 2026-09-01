'use client'

import { useRouter } from 'next/navigation'
import { PLAN_NOTICE } from '@/content/copy'
import { manwon } from '@/domain/format'
import { planTotal } from '@/domain/plan'
import { CtaBar, Notice, Panel, PrimaryButton, ScreenHeader } from '@/components/shell'
import { logEvent } from '@/state/events'
import { useDemo } from '@/state/store'

/** UI-003 변경 조건 — 쓸 카드 수 기본 2장(상한 2) · 신규 발급 기본 허용(최대 1장) (T6 · P04-R1). */
export default function ConstraintScreen() {
  const router = useRouter()
  const { plan, constraint, updateConstraint } = useDemo()

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
        step="변경 조건"
        title="어디까지 바꿔도 괜찮은지 알려주세요"
        lead="조건을 좁히면 화면이 단순해지고, 넓히면 더 나은 조합이 나올 수 있습니다."
        backHref="/app/plan"
      />
      <div className="scroll-area flex flex-col gap-3">
        <Panel>
          <p className="m-0 text-[14px] font-bold text-ink">앞으로 쓸 카드 수</p>
          <div className="mt-3 flex gap-2" role="group" aria-label="앞으로 쓸 카드 수">
            {[1, 2].map((count) => (
              <button
                key={count}
                type="button"
                aria-pressed={constraint.max_cards === count}
                onClick={() => updateConstraint({ max_cards: count })}
                className={`flex-1 rounded-xl border py-3 text-[15px] font-bold ${
                  constraint.max_cards === count
                    ? 'border-primary bg-[#E8F0FF] text-primary'
                    : 'border-line text-muted'
                }`}
              >
                {count}장
              </button>
            ))}
          </div>
          <p className="mt-2 mb-0 text-[12px] text-muted">
            상한은 화면 복잡도 때문에 2장으로 정했습니다. 그 이상 조합은 계산하지 않습니다.
          </p>
        </Panel>

        <Panel>
          <p className="m-0 text-[14px] font-bold text-ink">신규 발급을 비교에 넣을까요?</p>
          <div className="mt-3 flex gap-2" role="group" aria-label="신규 발급 허용">
            {[
              { value: true, label: '넣어요 (최대 1장)' },
              { value: false, label: '빼요' },
            ].map((option) => (
              <button
                key={String(option.value)}
                type="button"
                aria-pressed={constraint.allow_new_card === option.value}
                onClick={() => updateConstraint({ allow_new_card: option.value })}
                className={`flex-1 rounded-xl border py-3 text-[14px] font-bold ${
                  constraint.allow_new_card === option.value
                    ? 'border-primary bg-[#E8F0FF] text-primary'
                    : 'border-line text-muted'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Panel>

        <Panel tone="bg">
          <p className="m-0 text-[13px] text-muted">확인할 앞으로 12개월 계획</p>
          <p className="mt-1 mb-0 text-[20px] font-extrabold text-ink tabular-nums">
            {plan.length}건 · 순증 {manwon(planTotal(plan))}
          </p>
        </Panel>

        <Notice>
          여기서 누르면 화면의 전체 값을 앞으로 12개월 지출 계획으로 확인한 것으로 봅니다. 계산 엔진이
          이 값을 임의로 늘리거나 줄이지 않습니다.
        </Notice>
      </div>
      <CtaBar>
        <PrimaryButton onClick={confirm}>{PLAN_NOTICE.confirmCta}</PrimaryButton>
      </CtaBar>
    </>
  )
}
