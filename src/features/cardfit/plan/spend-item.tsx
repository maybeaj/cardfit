'use client'

import { PLAN_NOTICE } from '@/content/copy'
import type { FutureSpendPlan } from '@/domain/types'
import { APP_CATEGORIES } from '@/fixtures/mydata/categories'

/**
 * UI-002 지출 항목 한 줄 — 카테고리·금액·방향·시점.
 *
 * 금액은 항상 양수로 받고 늘어남·줄어듦은 토글로 정한다 — 금액 칸에 마이너스를
 * 직접 입력받으면 부호를 잘못 넣기 쉽다 (`T20`).
 *
 * 항목이 자기 `plan_id`를 알 필요가 없다. 바뀐 값만 위로 올리고 어느 항목인지는
 * 부르는 쪽이 안다 — 목록의 키 관리와 항목의 표시를 섞지 않는다.
 */
export function SpendItem({
  item,
  onChange,
  onRemove,
}: {
  item: FutureSpendPlan
  onChange: (next: Partial<FutureSpendPlan>) => void
  onRemove: () => void
}) {
  return (
    <div className="spend">
      <div className="spend-header">
        <select
          className="spend-category"
          aria-label={`${item.category} 카테고리`}
          value={item.category}
          onChange={(event) => onChange({ category: event.target.value })}
        >
          {APP_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="delete-spend"
          aria-label={`${item.category} 항목 삭제`}
          onClick={onRemove}
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
              onChange({ amount: Math.max(0, Number(event.target.value) || 0) })
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
            onClick={() => onChange({ direction: 'increase' })}
          >
            {PLAN_NOTICE.increase}
          </button>
          <button
            type="button"
            className={item.direction === 'decrease' ? 'active' : ''}
            aria-pressed={item.direction === 'decrease'}
            onClick={() => onChange({ direction: 'decrease' })}
          >
            {PLAN_NOTICE.decrease}
          </button>
        </div>
      </div>

      <select
        aria-label={`${item.category} 시점`}
        value={item.month_offset}
        onChange={(event) => onChange({ month_offset: Number(event.target.value) })}
      >
        {Array.from({ length: 12 }, (_, n) => (
          <option key={n + 1} value={n + 1}>
            {n + 1}개월 내
          </option>
        ))}
      </select>
    </div>
  )
}
