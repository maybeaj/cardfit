'use client'

import { PLAN_NOTICE } from '@/content/copy'
import type { FutureSpendPlan } from '@/domain/types'
import { APP_CATEGORIES } from '@/fixtures/mydata/categories'

/**
 * UI-002 지출 항목 한 줄 — 카테고리·금액·시점.
 *
 * 증감 토글과 감소 입력을 두지 않는다 (`T10`). 입력한 금액은 전부 추가 지출이다 —
 * 감소를 받으면 카드 사용을 줄이라는 서비스로 읽힌다.
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
