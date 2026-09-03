'use client'

import { useState } from 'react'
import { PLAN_NOTICE } from '@/content/copy'
import { APP_CATEGORIES } from '@/fixtures/mydata/categories'

/**
 * UI-002 지출 항목 추가 — 기준본 s3의 `#categoryPicker`.
 *
 * 버튼을 누르면 카테고리 선택지가 펼쳐지고, 고른 뒤에 항목이 추가된다.
 * 빈 항목을 먼저 만들고 카테고리를 고르게 하면 무엇을 추가하는지 모른 채 줄이 늘어난다.
 */
export function AddSpendPicker({ onAdd }: { onAdd: (category: string) => void }) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<string>(APP_CATEGORIES[0] as string)

  const add = () => {
    onAdd(category)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        className="add-spend-button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {PLAN_NOTICE.addItem}
      </button>

      {open ? (
        <div className="category-picker">
          <label htmlFor="new-category">
            <b>{PLAN_NOTICE.addCategoryTitle}</b>
            <select
              id="new-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {APP_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={add}>
            {PLAN_NOTICE.addCategoryCta}
          </button>
          <small>{PLAN_NOTICE.addCategoryNote}</small>
        </div>
      ) : null}
    </>
  )
}
