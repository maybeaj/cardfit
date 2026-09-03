'use client'

import { useMemo, useState } from 'react'
import { PLAN_NOTICE } from '@/content/copy'
import { manwon } from '@/domain/format'
import { isPlanEmpty, planTotal } from '@/domain/plan'
import type { FutureSpendPlan } from '@/domain/types'
import { APP_CATEGORIES } from '@/fixtures/mydata/categories'
import {
  Actions,
  ErrorNote,
  GhostLink,
  PrimaryButton,
  PrimaryLink,
  Screen,
  ScreenHeader,
  SecondaryButton,
} from '@/components/shell'
import { logEvent } from '@/state/events'
import { useDemo } from '@/state/store'

/** 기준본 s3의 카테고리 선택지. 결과 배분표의 행 이름과 같아야 사용자가 대조할 수 있다 */
const CATEGORY_OPTIONS = APP_CATEGORIES

/**
 * UI-002 미래지출 입력 — 기준본 s3.
 *
 * 빈 폼으로 열지 않는다 (`T3` · FR-006). 감소는 항목별 토글로 받고 금액은 항상 양수다 (`T20`).
 * 이벤트 필수 선택 단계를 두지 않는다 (`AC-007`).
 */
export default function PlanScreen() {
  const { plan, updatePlan, refillPlan } = useDemo()
  const empty = useMemo(() => isPlanEmpty(plan), [plan])
  // 기준본 s3의 `#categoryPicker` — 항목 추가 버튼이 선택지를 펼친다
  const [pickerOpen, setPickerOpen] = useState(false)
  const [newCategory, setNewCategory] = useState<string>(CATEGORY_OPTIONS[0] as string)

  const patchItem = (planId: string, next: Partial<FutureSpendPlan>) => {
    updatePlan(
      plan.map((item) => (item.plan_id === planId ? { ...item, ...next, source: 'user' } : item)),
    )
  }

  const removeItem = (planId: string) => updatePlan(plan.filter((item) => item.plan_id !== planId))

  const addSelectedCategory = () => {
    updatePlan([
      ...plan,
      {
        plan_id: `u${Date.now()}`,
        category: newCategory,
        amount: 0,
        direction: 'increase',
        month_offset: 3,
        source: 'user',
      },
    ])
    setPickerOpen(false)
  }

  return (
    <Screen>
      <ScreenHeader
        title={PLAN_NOTICE.title}
        lead={PLAN_NOTICE.lead}
        backHref="/app/summary"
      />

      {/* 빈 폼으로 열지 않는다는 사실을 화면에서도 밝힌다 (T3 · FR-006) */}
      <p className="footer">{PLAN_NOTICE.prefilled}</p>

      <div className="mt-1">
        {plan.map((item) => (
          <div key={item.plan_id} className="spend">
            <div className="spend-header">
              <select
                className="spend-category"
                aria-label={`${item.category} 카테고리`}
                value={item.category}
                onChange={(event) => patchItem(item.plan_id, { category: event.target.value })}
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="delete-spend"
                aria-label={`${item.category} 항목 삭제`}
                onClick={() => removeItem(item.plan_id)}
              >
                {PLAN_NOTICE.remove}
              </button>
            </div>

            <div className="spend-controls">
              <div className="amount-field">
                <input
                  type="number"
                  min={0}
                  step={10000}
                  inputMode="numeric"
                  aria-label={`${item.category} 금액`}
                  value={item.amount}
                  onChange={(event) =>
                    patchItem(item.plan_id, {
                      amount: Math.max(0, Number(event.target.value) || 0),
                    })
                  }
                />
                <small>원</small>
              </div>
              {/* 금액 칸에 마이너스를 직접 입력받지 않는다 (T20) */}
              <div className="toggle" role="group" aria-label={`${item.category} 지출 방향`}>
                <button
                  type="button"
                  className={item.direction === 'increase' ? 'active' : ''}
                  aria-pressed={item.direction === 'increase'}
                  onClick={() => patchItem(item.plan_id, { direction: 'increase' })}
                >
                  {PLAN_NOTICE.increase}
                </button>
                <button
                  type="button"
                  className={item.direction === 'decrease' ? 'active' : ''}
                  aria-pressed={item.direction === 'decrease'}
                  onClick={() => patchItem(item.plan_id, { direction: 'decrease' })}
                >
                  {PLAN_NOTICE.decrease}
                </button>
              </div>
            </div>

            <select
              aria-label={`${item.category} 시점`}
              value={item.month_offset}
              onChange={(event) =>
                patchItem(item.plan_id, { month_offset: Number(event.target.value) })
              }
            >
              {Array.from({ length: 12 }, (_, n) => (
                <option key={n + 1} value={n + 1}>
                  {n + 1}개월 내
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="add-spend-button"
        aria-expanded={pickerOpen}
        onClick={() => setPickerOpen((prev) => !prev)}
      >
        {PLAN_NOTICE.addItem}
      </button>

      {pickerOpen ? (
        <div className="category-picker">
          <label htmlFor="new-category">
            <b>{PLAN_NOTICE.addCategoryTitle}</b>
            <select
              id="new-category"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={addSelectedCategory}>
            {PLAN_NOTICE.addCategoryCta}
          </button>
          <small>{PLAN_NOTICE.addCategoryNote}</small>
        </div>
      ) : null}

      {empty ? (
        <div className="mt-3 grid gap-2">
          <ErrorNote>{PLAN_NOTICE.emptyMessage}</ErrorNote>
          <SecondaryButton onClick={refillPlan}>{PLAN_NOTICE.refill}</SecondaryButton>
        </div>
      ) : (
        <div className="total">
          <span>확인할 앞으로 12개월 계획</span>
          <span className="tabular-nums">
            {plan.length}건 · 순증 {manwon(planTotal(plan))}
          </span>
        </div>
      )}

      <Actions>
        {empty ? (
          <PrimaryButton disabled>{PLAN_NOTICE.next}</PrimaryButton>
        ) : (
          <>
            <PrimaryLink
              href="/app/constraint"
              onClick={() => logEvent('입력완료', { items: plan.length })}
            >
              {PLAN_NOTICE.next}
            </PrimaryLink>
            {/*
              기준본 s3의 `이 단계 건너뛰기` — 제안값을 지우지 않고 그대로 둔 채 조건 화면으로 간다.
              수정 없이 넘어가는 것이므로 화면의 전체 값이 확인된 계획이 된다 (`T37`).
              계획이 0건이면 계산 자체가 막히므로 이때는 우회로를 남기지 않는다 (`AC-001`).
            */}
            <GhostLink href="/app/constraint">{PLAN_NOTICE.skip}</GhostLink>
          </>
        )}
      </Actions>
    </Screen>
  )
}
