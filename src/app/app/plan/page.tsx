'use client'

import { useMemo, useState } from 'react'
import { PLAN_NOTICE } from '@/content/cardfit-copy'
import Link from 'next/link'
import { won } from '@/domain/cardfit/format'
import { isPlanEmpty, planTotal } from '@/domain/cardfit/plan'
import type { FutureSpendPlan } from '@/domain/cardfit/types'
import { CategoryPickerSheet } from '@/features/cardfit/plan/category-picker-sheet'
import { SpendItem } from '@/features/cardfit/plan/spend-item'
import {
  Actions,
  PrimaryButton,
  PrimaryLink,
  Screen,
  ScreenHeader,
  SecondaryButton,
} from '@/components/shell'
import { logEvent } from '@/state/client-events'
import { useDemo } from '@/state/store'

/**
 * UI-002 미래지출 입력 — 기준본 s3.
 *
 * 빈 폼으로 열지 않는다 (`T3` · FR-006). 앞으로 늘어날 지출만 받는다 (`T10`).
 * 이벤트 필수 선택 단계를 두지 않는다 (`AC-007`).
 */
export default function PlanScreen() {
  const { plan, updatePlan, refillPlan } = useDemo()
  const empty = useMemo(() => isPlanEmpty(plan), [plan])

  /** 바텀시트가 열린 항목. `'new'`는 항목 추가용 */
  const [picking, setPicking] = useState<string | null>(null)
  /**
   * 삭제는 확인 없이 실행하고 되돌리기를 준다 (UI-002).
   * 확인 창을 띄우면 제안값을 정리하는 흐름이 매번 끊긴다. 자리를 기억해 두었다가
   * 되돌릴 때 원래 순서로 돌려놓는다 — 맨 뒤에 붙이면 목록이 뒤섞인다.
   */
  const [removed, setRemoved] = useState<{ item: FutureSpendPlan; at: number } | null>(null)

  const patchItem = (planId: string, next: Partial<FutureSpendPlan>) => {
    updatePlan(
      plan.map((item) => (item.plan_id === planId ? { ...item, ...next, source: 'user' } : item)),
    )
  }

  const removeItem = (planId: string) => {
    const at = plan.findIndex((item) => item.plan_id === planId)
    if (at < 0) return
    setRemoved({ item: plan[at]!, at })
    updatePlan(plan.filter((item) => item.plan_id !== planId))
  }

  const undoRemove = () => {
    if (!removed) return
    const next = [...plan]
    next.splice(Math.min(removed.at, next.length), 0, removed.item)
    updatePlan(next)
    setRemoved(null)
  }

  const addItem = (category: string) => {
    updatePlan([
      ...plan,
      {
        plan_id: `u${Date.now()}`,
        category,
        amount: 0,
        spending_months: 3,
        source: 'user',
      },
    ])
  }

  const pickCategory = (category: string) => {
    if (picking === 'new') addItem(category)
    else if (picking) patchItem(picking, { category })
    setPicking(null)
  }

  return (
    <Screen>
      <ScreenHeader title={PLAN_NOTICE.title} backHref="/app/summary" />

      {/* 빈 폼으로 열지 않는다는 사실을 화면에서도 밝힌다 (T3 · FR-006) */}
      <p className="footer">{PLAN_NOTICE.prefilled}</p>

      <div className="mt-1">
        {plan.map((item, index) => (
          <SpendItem
            key={item.plan_id}
            item={item}
            index={index}
            onChange={(next) => patchItem(item.plan_id, next)}
            onRemove={() => removeItem(item.plan_id)}
            onPickCategory={() => setPicking(item.plan_id)}
          />
        ))}
      </div>

      <button type="button" className="secondary add-spend-button" onClick={() => setPicking('new')}>
        {PLAN_NOTICE.addItem}
      </button>

      <CategoryPickerSheet
        open={picking !== null}
        selected={plan.find((item) => item.plan_id === picking)?.category}
        onSelect={pickCategory}
        onClose={() => setPicking(null)}
      />

      {removed ? (
        <div className="undo-bar" role="status">
          <span>{PLAN_NOTICE.removed(removed.item.category)}</span>
          <button type="button" onClick={undoRemove}>
            {PLAN_NOTICE.undo}
          </button>
        </div>
      ) : null}

      {/* 합계는 늘 자리를 지킨다 — 0건일 때만 그 자리에 안내가 대신 선다 */}
      {empty ? (
        <>
          <div className="error">{PLAN_NOTICE.emptyMessage}</div>
          <SecondaryButton onClick={refillPlan}>{PLAN_NOTICE.refill}</SecondaryButton>
        </>
      ) : (
        <div className="future-total">
          <span>{PLAN_NOTICE.totalLabel}</span>
          <strong className="tabular-nums">{won(planTotal(plan))}</strong>
        </div>
      )}

      <Actions>
        {empty ? (
          <PrimaryButton disabled>{PLAN_NOTICE.next}</PrimaryButton>
        ) : (
          <>
            {/*
              기준본 s3의 `건너뛰기` — 제안값을 지우지 않고 그대로 둔 채 조건 화면으로 간다.
              수정 없이 넘어가는 것이므로 화면의 전체 값이 확인된 계획이 된다 (`T37`).
              계획이 0건이면 계산 자체가 막히므로 이때는 우회로를 남기지 않는다 (`AC-001`).
            */}
            <Link className="skip-action" href="/app/constraint">
              {PLAN_NOTICE.skip}
            </Link>
            <PrimaryLink
              href="/app/constraint"
              onClick={() => logEvent('입력완료', { items: plan.length })}
            >
              {PLAN_NOTICE.next}
            </PrimaryLink>
          </>
        )}
      </Actions>
    </Screen>
  )
}
