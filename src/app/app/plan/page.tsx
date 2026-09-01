'use client'

import { useMemo } from 'react'
import { PLAN_NOTICE } from '@/content/copy'
import { manwon, monthLabel } from '@/domain/format'
import { isPlanEmpty } from '@/domain/plan'
import type { FutureSpendPlan } from '@/domain/types'
import { CtaBar, Notice, Panel, PrimaryLink, ScreenHeader } from '@/components/ui'
import { logEvent } from '@/state/events'
import { useDemo } from '@/state/store'

const CATEGORY_OPTIONS = ['가전·가구', '여행', '예식', '식비', '쇼핑', '생활', '교통', '기타']

/**
 * UI-002 미래지출 입력 — 빈 폼으로 열지 않는다 (T3 · FR-006).
 * 감소는 항목별 토글로 받고 금액은 항상 양수로 입력받는다 (T20).
 * 이벤트 필수 선택 단계를 두지 않는다 (AC-007).
 */
export default function PlanScreen() {
  const { profile, plan, updatePlan, refillPlan } = useDemo()
  const empty = useMemo(() => isPlanEmpty(plan), [plan])

  const patchItem = (planId: string, next: Partial<FutureSpendPlan>) => {
    updatePlan(
      plan.map((item) => (item.plan_id === planId ? { ...item, ...next, source: 'user' } : item)),
    )
  }

  const removeItem = (planId: string) => {
    updatePlan(plan.filter((item) => item.plan_id !== planId))
  }

  const addItem = () => {
    updatePlan([
      ...plan,
      {
        plan_id: `u${Date.now()}`,
        category: '기타',
        amount: 0,
        direction: 'increase',
        month_offset: 1,
        source: 'user',
      },
    ])
  }

  return (
    <>
      <ScreenHeader
        step="앞으로 12개월"
        title="앞으로 쓸 돈을 알려주세요"
        lead="이벤트 이름은 묻지 않아요. 카테고리·금액·시점만 있으면 됩니다."
        backHref="/app/diagnosis"
      />
      <div className="scroll-area flex flex-col gap-3">
        <Notice>{PLAN_NOTICE.prefilled}</Notice>

        {plan.map((item) => (
          <Panel key={item.plan_id}>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`cat-${item.plan_id}`}>
                카테고리
              </label>
              <select
                id={`cat-${item.plan_id}`}
                value={item.category}
                onChange={(event) => patchItem(item.plan_id, { category: event.target.value })}
                className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-[15px] font-semibold text-ink"
              >
                {[...new Set([item.category, ...CATEGORY_OPTIONS])].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeItem(item.plan_id)}
                aria-label={`${item.category} 항목 삭제`}
                className="rounded-xl border border-line px-3 py-2 text-[13px] text-muted"
              >
                삭제
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex rounded-xl border border-line p-0.5" role="group" aria-label="지출 방향">
                {(['increase', 'decrease'] as const).map((direction) => (
                  <button
                    key={direction}
                    type="button"
                    aria-pressed={item.direction === direction}
                    onClick={() => patchItem(item.plan_id, { direction })}
                    className={`rounded-lg px-3 py-1.5 text-[13px] font-bold ${
                      item.direction === direction ? 'bg-primary text-white' : 'text-muted'
                    }`}
                  >
                    {direction === 'increase' ? '+ 늘어요' : '− 줄어요'}
                  </button>
                ))}
              </div>
              <label className="sr-only" htmlFor={`month-${item.plan_id}`}>
                시점
              </label>
              <select
                id={`month-${item.plan_id}`}
                value={item.month_offset}
                onChange={(event) =>
                  patchItem(item.plan_id, { month_offset: Number(event.target.value) })
                }
                className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-[14px] text-ink"
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map((offset) => (
                  <option key={offset} value={offset}>
                    {monthLabel(profile.as_of_date, offset)} ({offset}개월 뒤)
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <label className="sr-only" htmlFor={`amount-${item.plan_id}`}>
                금액
              </label>
              <input
                id={`amount-${item.plan_id}`}
                type="number"
                min={0}
                step={10000}
                inputMode="numeric"
                value={item.amount}
                onChange={(event) =>
                  patchItem(item.plan_id, { amount: Math.max(0, Number(event.target.value) || 0) })
                }
                className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-right text-[17px] font-extrabold text-ink tabular-nums"
              />
              <span className="text-[14px] font-semibold text-muted">원</span>
            </div>
            <p className="mt-2 mb-0 text-[12px] text-muted">
              {item.direction === 'increase' ? '늘어나는' : '줄어드는'} 금액 {manwon(item.amount)} ·
              출처 {item.source === 'suggested' ? '최근 소비 패턴 제안값' : '직접 입력'}
            </p>
          </Panel>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="rounded-[var(--radius-button)] border border-dashed border-line py-3 text-[14px] font-semibold text-primary"
        >
          + 지출 추가
        </button>

        {empty ? (
          <>
            <Notice tone="warning">{PLAN_NOTICE.emptyBlocked}</Notice>
            <button
              type="button"
              onClick={refillPlan}
              className="rounded-[var(--radius-button)] border border-line py-3 text-[14px] font-semibold text-ink"
            >
              {PLAN_NOTICE.refill}
            </button>
          </>
        ) : null}
      </div>
      <CtaBar>
        {empty ? (
          <button
            type="button"
            disabled
            className="block w-full min-h-[52px] cursor-not-allowed rounded-[var(--radius-button)] bg-[#D8DEEA] px-4 py-[15px] text-center text-[16px] font-bold text-[#98A1B0]"
          >
            다음
          </button>
        ) : (
          <PrimaryLink href="/app/constraint" onClick={() => logEvent('입력완료', { items: plan.length })}>
            다음
          </PrimaryLink>
        )}
      </CtaBar>
    </>
  )
}
