'use client'

import { useMemo } from 'react'
import { PLAN_NOTICE } from '@/content/copy'
import { manwon, monthLabel } from '@/domain/format'
import { isPlanEmpty } from '@/domain/plan'
import type { FutureSpendPlan } from '@/domain/types'
import { CtaBar, Notice, Panel, PrimaryLink, ScreenHeader } from '@/components/shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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

  const removeItem = (planId: string) => updatePlan(plan.filter((item) => item.plan_id !== planId))

  const addItem = () =>
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
              <Label className="sr-only" htmlFor={`cat-${item.plan_id}`}>
                카테고리
              </Label>
              <Select
                value={item.category}
                onValueChange={(category) => patchItem(item.plan_id, { category })}
              >
                <SelectTrigger id={`cat-${item.plan_id}`} className="flex-1 text-[15px] font-semibold">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  {[...new Set([item.category, ...CATEGORY_OPTIONS])].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={() => removeItem(item.plan_id)}
                aria-label={`${item.category} 항목 삭제`}
                className="text-[13px] text-muted"
              >
                삭제
              </Button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={item.direction}
                onValueChange={(next) => {
                  if (next === 'increase' || next === 'decrease') {
                    patchItem(item.plan_id, { direction: next })
                  }
                }}
                aria-label="지출 방향"
                className="shrink-0"
              >
                <ToggleGroupItem value="increase" className="px-3 text-[13px] font-bold">
                  + 늘어요
                </ToggleGroupItem>
                <ToggleGroupItem value="decrease" className="px-3 text-[13px] font-bold">
                  − 줄어요
                </ToggleGroupItem>
              </ToggleGroup>

              <Label className="sr-only" htmlFor={`month-${item.plan_id}`}>
                시점
              </Label>
              <Select
                value={String(item.month_offset)}
                onValueChange={(next) => patchItem(item.plan_id, { month_offset: Number(next) })}
              >
                <SelectTrigger id={`month-${item.plan_id}`} className="flex-1 text-[14px]">
                  <SelectValue placeholder="시점" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((offset) => (
                    <SelectItem key={offset} value={String(offset)}>
                      {monthLabel(profile.as_of_date, offset)} ({offset}개월 뒤)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Label className="sr-only" htmlFor={`amount-${item.plan_id}`}>
                금액
              </Label>
              <Input
                id={`amount-${item.plan_id}`}
                type="number"
                min={0}
                step={10000}
                inputMode="numeric"
                value={item.amount}
                onChange={(event) =>
                  patchItem(item.plan_id, { amount: Math.max(0, Number(event.target.value) || 0) })
                }
                className="flex-1 text-right text-[17px] font-extrabold text-ink tabular-nums"
              />
              <span className="text-[14px] font-semibold text-muted">원</span>
            </div>
            <p className="mt-2 mb-0 text-[12px] text-muted">
              {item.direction === 'increase' ? '늘어나는' : '줄어드는'} 금액 {manwon(item.amount)} ·
              출처 {item.source === 'suggested' ? '최근 소비 패턴 제안값' : '직접 입력'}
            </p>
          </Panel>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="border-dashed py-3 text-[14px] font-semibold text-primary"
        >
          + 지출 추가
        </Button>

        {empty ? (
          <>
            <Notice tone="warning">{PLAN_NOTICE.emptyBlocked}</Notice>
            <Button type="button" variant="outline" onClick={refillPlan} className="text-[14px]">
              {PLAN_NOTICE.refill}
            </Button>
          </>
        ) : null}
      </div>
      <CtaBar>
        {empty ? (
          <Button type="button" size="lg" disabled className="w-full min-h-[52px] rounded-[var(--radius-button)] text-[16px] font-bold">
            다음
          </Button>
        ) : (
          <PrimaryLink href="/app/constraint" onClick={() => logEvent('입력완료', { items: plan.length })}>
            다음
          </PrimaryLink>
        )}
      </CtaBar>
    </>
  )
}
