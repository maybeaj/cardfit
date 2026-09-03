'use client'

import { CONSTRAINT_COPY } from '@/content/copy'

/**
 * UI-003 사용 카드 최대 수 — 기준본 s4의 스테퍼.
 *
 * 1~3장을 고른다 (`T11`). 상한은 화면 복잡도를 기준으로 정한 값이라 최적 조합을
 * 보장하지 않으며, 그 이상 조합은 계산하지 않는다 (`T39`).
 */
export const MIN_CARDS = 1
export const MAX_CARDS = 3

export function CardCountStepper({
  value,
  onChange,
}: {
  value: number
  onChange: (next: number) => void
}) {
  const step = (delta: number) => onChange(Math.min(MAX_CARDS, Math.max(MIN_CARDS, value + delta)))

  return (
    <div className="rule">
      <div>
        <b>{CONSTRAINT_COPY.maxCardsLabel}</b>
        <small className="sub block">{CONSTRAINT_COPY.maxCardsHint}</small>
      </div>
      <div className="stepper">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={value <= MIN_CARDS}
          aria-label="사용 카드 최대 수 줄이기"
        >
          −
        </button>
        <b aria-live="polite" className="tabular-nums">
          {value}
        </b>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={value >= MAX_CARDS}
          aria-label="사용 카드 최대 수 늘리기"
        >
          ＋
        </button>
      </div>
    </div>
  )
}
