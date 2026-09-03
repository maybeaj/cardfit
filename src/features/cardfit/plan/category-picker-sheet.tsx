'use client'

import { PLAN_NOTICE } from '@/content/copy'
import { APP_CATEGORIES } from '@/fixtures/mydata/categories'
import { BottomSheet, useSheetTitleId } from '@/components/overlay/bottom-sheet'

/**
 * UI-002 카테고리 선택 — 기준본 s3의 `#categorySheet`.
 *
 * 드롭다운을 쓰지 않는 이유 — 카테고리가 17개라 목록이 화면을 덮고, 무엇을 고르는지
 * 모른 채 스크롤하게 된다. 묶어서 접어 두면 한 번에 보이는 선택지가 줄어든다.
 *
 * 묶음은 카드 혜택 조건이 아니라 **사용자가 지출을 떠올리는 방식**을 따른다. 계산은
 * 개별 카테고리로 하므로 묶음이 결과를 바꾸지 않는다.
 */
const CATEGORY_GROUPS: { label: string; items: string[] }[] = [
  { label: '여행', items: ['여행'] },
  { label: '교통·차량', items: ['교통', '주유'] },
  {
    label: '쇼핑·생활',
    items: ['쇼핑', '백화점', '마트', '편의점', '가전/가구', '생활', '간편결제'],
  },
  { label: '식비·여가', items: ['음식/배달', '카페', '구독'] },
  { label: '통신', items: ['통신'] },
  { label: '이벤트', items: ['예식'] },
  { label: '기타', items: ['전 가맹점', '기타'] },
]

/** 묶음에서 빠진 카테고리가 생기면 고를 수 없게 된다 — 남는 것은 `기타`로 모은다 */
const GROUPED = new Set(CATEGORY_GROUPS.flatMap((group) => group.items))
const GROUPS = CATEGORY_GROUPS.map((group) =>
  group.label === '기타'
    ? { ...group, items: [...group.items, ...APP_CATEGORIES.filter((c) => !GROUPED.has(c))] }
    : group,
)

export function CategoryPickerSheet({
  open,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean
  /** 기존 항목의 카테고리를 바꾸는 경우. 새 항목 추가면 비어 있다 */
  selected?: string
  onSelect: (category: string) => void
  onClose: () => void
}) {
  const titleId = useSheetTitleId()

  return (
    <BottomSheet open={open} onClose={onClose} labelledBy={titleId} className="category-sheet">
      <h2 id={titleId} className="category-sheet-title">
        {PLAN_NOTICE.addCategoryTitle}
      </h2>

      <div className="category-sheet-groups">
        {GROUPS.map((group) => (
          <details
            key={group.label}
            className="category-group"
            /* 고르던 카테고리가 든 묶음만 펴 둔다 — 어디서 왔는지 잃지 않게 */
            open={selected ? group.items.includes(selected) : undefined}
          >
            <summary>{group.label}</summary>
            <div className="category-options">
              {group.items.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={category === selected ? 'selected' : undefined}
                  onClick={() => onSelect(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </details>
        ))}
      </div>

      <button type="button" className="category-sheet-close" onClick={onClose}>
        {PLAN_NOTICE.categorySheetClose}
      </button>
    </BottomSheet>
  )
}
