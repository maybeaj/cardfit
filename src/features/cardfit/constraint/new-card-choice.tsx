'use client'

import { CONSTRAINT_COPY } from '@/content/copy'

/** UI-003 신규 카드 포함 여부 — 기준본 s4의 예/아니오. 신규는 최대 1장이다 (`T6`). */
export function NewCardChoice({
  value,
  onChange,
}: {
  value: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="rule">
      <div>
        <b>{CONSTRAINT_COPY.newCardLabel}</b>
        <small className="sub block">{CONSTRAINT_COPY.newCardHint}</small>
      </div>
      <div className="choice-group" role="group" aria-label={CONSTRAINT_COPY.newCardLabel}>
        {[
          { value: true, label: CONSTRAINT_COPY.yes },
          { value: false, label: CONSTRAINT_COPY.no },
        ].map((option) => (
          <button
            key={String(option.value)}
            type="button"
            className={`choice ${value === option.value ? 'active' : ''}`}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
