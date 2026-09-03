'use client'

import { CONCLUSION_COPY } from '@/content/cardfit-copy'

/**
 * 지출 탐색 탭 — 기준본 s5의 `.scenario-explorer`.
 *
 * 확인한 계획이 예상보다 적거나 많을 때의 결과를 사용자가 눌러서 본다.
 * `예상대로`가 확인한 계획 그대로이고 기본값이다 — 엔진이 계획을 임의로 바꾸는 것이
 * 아니라 사용자가 고른 가정으로 다시 계산하는 것이라 `T37`과 어긋나지 않는다.
 */
export function ScenarioTabs({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (key: string) => void
}) {
  return (
    <div className="scenario-explorer">
      <span className="label">{CONCLUSION_COPY.scenario.label}</span>
      <div className="scenario-tabs" role="group" aria-label="지출 탐색">
        {CONCLUSION_COPY.scenario.options.map((option) => (
          <button
            key={option.key}
            type="button"
            className={selected === option.key ? 'active' : ''}
            aria-pressed={selected === option.key}
            onClick={() => onSelect(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
