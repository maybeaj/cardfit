'use client'

import { PLAN_NOTICE } from '@/content/cardfit-copy'
import { won } from '@/domain/cardfit/format'
import { SPENDING_MONTHS, type FutureSpendPlan } from '@/domain/cardfit/types'

/**
 * UI-002 지출 항목 한 줄 — 카테고리·금액·지출 기간.
 *
 * 증감 토글과 감소 입력을 두지 않는다 (`T10`). 입력한 금액은 전부 추가 지출이다 —
 * 감소를 받으면 카드 사용을 줄이라는 서비스로 읽힌다.
 *
 * 금액은 **만원 단위로 받고 원으로 되읽어 준다**. 원 단위로 받으면 840만원을 넣으려다
 * 840을 넣는 자릿수 오입력이 잡히지 않는다. 도메인은 계속 원으로 들고 있고 이 컴포넌트가
 * 경계에서만 환산한다 — 저장 단위를 화면 사정으로 바꾸지 않는다.
 *
 * 항목이 자기 `plan_id`를 알 필요가 없다. 바뀐 값만 위로 올리고 어느 항목인지는
 * 부르는 쪽이 안다 — 목록의 키 관리와 항목의 표시를 섞지 않는다.
 */
const MANWON = 10_000

export function SpendItem({
  item,
  index,
  onChange,
  onRemove,
  onPickCategory,
}: {
  item: FutureSpendPlan
  /** 라벨을 첫 항목에만 보이게 하려고 받는다 */
  index: number
  onChange: (next: Partial<FutureSpendPlan>) => void
  onRemove: () => void
  onPickCategory: () => void
}) {
  const amountLabelId = `spend-amount-${item.plan_id}`

  return (
    <div className="spend">
      <div className="spend-header">
        <span className="spend-index" aria-hidden>
          {index + 1}
        </span>
        <button
          type="button"
          className="category-trigger"
          aria-label={`${item.category} 카테고리 선택`}
          onClick={onPickCategory}
        >
          {item.category}
        </button>
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
        {/*
          라벨은 첫 항목에만 보인다. 항목마다 반복하면 같은 문장이 화면을 채워
          정작 입력값이 안 보인다. 보조기술에는 `aria-label`로 계속 전달한다.
        */}
        <label
          className={index === 0 ? 'amount-label' : 'amount-label sr-only'}
          htmlFor={amountLabelId}
        >
          {PLAN_NOTICE.amountLabel}
        </label>
        <div className="amount-field">
          <input
            id={amountLabelId}
            type="number"
            min={0}
            inputMode="numeric"
            aria-label={`${item.category} ${PLAN_NOTICE.amountLabel} (${PLAN_NOTICE.amountUnit})`}
            value={item.amount / MANWON}
            onChange={(event) =>
              onChange({ amount: Math.max(0, Number(event.target.value) || 0) * MANWON })
            }
          />
          <small>{PLAN_NOTICE.amountUnit}</small>
        </div>
        <span className="amount-echo" aria-hidden>
          {item.amount > 0 ? won(item.amount) : PLAN_NOTICE.amountZero}
        </span>
      </div>

      {/*
        기간 선택이 결과를 바꾼다 — 같은 금액도 한 달에 몰면 월 혜택한도에 걸리고
        열두 달에 펴면 실적구간을 못 넘는다. 시점이 아니라 기간을 묻는 이유다.
      */}
      <div className="spend-duration">
        <span className="spend-duration-label">
          {index === 0 ? PLAN_NOTICE.durationQuestion : PLAN_NOTICE.durationShort}
        </span>
        <div className="duration-options" role="group" aria-label={`${item.category} 지출 기간`}>
          {SPENDING_MONTHS.map((months) => (
            <button
              key={months}
              type="button"
              className={item.spending_months === months ? 'active' : ''}
              aria-pressed={item.spending_months === months}
              onClick={() => onChange({ spending_months: months })}
            >
              {months === 1 ? PLAN_NOTICE.once : PLAN_NOTICE.months(months)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
