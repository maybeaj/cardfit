'use client'

import { useMemo, useState } from 'react'
import { PLAN_NOTICE } from '@/content/copy'
import { manwon, monthLabel } from '@/domain/format'
import { isPlanEmpty } from '@/domain/plan'
import type { FutureSpendPlan } from '@/domain/types'
import { APP_CATEGORIES } from '@/fixtures/mydata/categories'
import {
  CtaBar,
  Notice,
  Panel,
  PrimaryLink,
  ScreenHeader,
  SecondaryLink,
} from '@/components/shell'
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

/** 기준본 s3의 카테고리 선택지. 결과 배분표의 행 이름과 같아야 사용자가 대조할 수 있다 */
const CATEGORY_OPTIONS = APP_CATEGORIES

/**
 * UI-002 미래지출 입력 — 빈 폼으로 열지 않는다 (T3 · FR-006).
 * 감소는 항목별 토글로 받고 금액은 항상 양수로 입력받는다 (T20).
 * 이벤트 필수 선택 단계를 두지 않는다 (AC-007).
 */
export default function PlanScreen() {
  const { profile, plan, updatePlan, refillPlan } = useDemo()
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
    <>
      <ScreenHeader
        step="미래 지출 확인"
        title={PLAN_NOTICE.title}
        lead={PLAN_NOTICE.lead}
        backHref="/app/summary"
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
                className="text-[13px] text-subtle"
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
              <span className="text-[14px] font-semibold text-subtle">원</span>
            </div>
            <p className="mt-2 mb-0 text-[12px] text-subtle">
              {item.direction === 'increase' ? '늘어나는' : '줄어드는'} 금액 {manwon(item.amount)} ·
              출처 {item.source === 'suggested' ? '최근 소비 패턴 제안값' : '직접 입력'}
            </p>
          </Panel>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => setPickerOpen((prev) => !prev)}
          aria-expanded={pickerOpen}
          className="border-dashed py-3 text-[14px] font-semibold text-primary"
        >
          {PLAN_NOTICE.addItem}
        </Button>

        {pickerOpen ? (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 rounded-[13px] border border-primary/30 bg-primary-soft/40 p-3">
            <div className="min-w-0">
              <Label htmlFor="new-category" className="mb-1.5 block text-[10px] font-bold text-ink">
                {PLAN_NOTICE.addCategoryTitle}
              </Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger id="new-category" className="w-full text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={addSelectedCategory}
              className="text-[10px] whitespace-nowrap"
            >
              {PLAN_NOTICE.addCategoryCta}
            </Button>
            <small className="col-span-2 text-[9px] leading-[1.4] text-subtle">
              {PLAN_NOTICE.addCategoryNote}
            </small>
          </div>
        ) : null}

        {empty ? (
          <>
            <Notice tone="warning">{PLAN_NOTICE.emptyMessage}</Notice>
            <Button type="button" variant="outline" onClick={refillPlan} className="text-[14px]">
              {PLAN_NOTICE.refill}
            </Button>
          </>
        ) : null}
      </div>
      <CtaBar>
        <div className="flex flex-col gap-2">
          {empty ? (
            <Button
              type="button"
              size="lg"
              disabled
              className="min-h-[52px] w-full rounded-[var(--radius-button)] text-[16px] font-bold"
            >
              {PLAN_NOTICE.next}
            </Button>
          ) : (
            <PrimaryLink
              href="/app/constraint"
              onClick={() => logEvent('입력완료', { items: plan.length })}
            >
              {PLAN_NOTICE.next}
            </PrimaryLink>
          )}
          {/*
            기준본 s3의 `이 단계 건너뛰기` — 제안값을 지우지 않고 그대로 둔 채 조건 화면으로 간다.
            수정 없이 넘어가는 것이므로 화면의 전체 값이 확인된 계획이 된다 (`T37`).
            계획이 0건이면 계산 자체가 막히므로 이때는 건너뛰기도 숨긴다 (`AC-001`).
          */}
          {empty ? null : (
            <SecondaryLink href="/app/constraint">{PLAN_NOTICE.skip}</SecondaryLink>
          )}
        </div>
      </CtaBar>
    </>
  )
}
