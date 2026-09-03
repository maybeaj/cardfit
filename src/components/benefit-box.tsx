'use client'

import { CONCLUSION_COPY } from '@/content/copy'
import { won } from '@/domain/format'
import type { Calculation } from '@/domain/types'

/**
 * UI-005 결론 상자 — 기준본 s5의 `#resultBox`.
 *
 * 앞세우는 값은 **이 조합이 12개월 동안 받을 절대 혜택**이고, 현재 조합 대비 증가분은
 * 뱃지로 붙인다. 차액만 크게 띄우면 "얼마를 받는지"가 화면에서 사라져 사용자가
 * 조합의 크기를 가늠하지 못한다.
 *
 * 유지 결론에서는 금액 대신 `현재 조합 유지`를 띄운다 — 바꾸지 않는 것이 결론이므로
 * 받을 금액을 앞세우면 변경을 권하는 것처럼 읽힌다 (`T21` · `T26`).
 */
export function BenefitBox({
  calculation,
  scenarioLabel,
  onOpenEvidence,
}: {
  calculation: Calculation
  scenarioLabel: string
  onOpenEvidence: () => void
}) {
  const pass = calculation.decision === '변경'
  const chosen = pass ? calculation.chosen : calculation.current
  const copy = CONCLUSION_COPY.benefit

  return (
    <div className={pass ? 'result' : 'result hold'}>
      {pass ? (
        <>
          <span className="benefit-label">{copy.label}</span>
          <strong className="benefit-value">
            <small>{copy.unit}</small> {won(chosen.gross_benefit_absolute)}
          </strong>
          <span className="benefit-delta">{copy.delta(won(chosen.gross_benefit))}</span>
        </>
      ) : (
        <>
          <span className="benefit-label">{copy.holdLabel(scenarioLabel)}</span>
          <strong className="benefit-value">{copy.holdValue}</strong>
          <span className="benefit-delta">{copy.holdDelta}</span>
        </>
      )}

      <button type="button" className="result-evidence-trigger" onClick={onOpenEvidence}>
        <span>{pass ? copy.evidenceTrigger : copy.holdEvidenceTrigger}</span>
        <span aria-hidden>›</span>
      </button>
    </div>
  )
}
