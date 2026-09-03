'use client'

import { CONCLUSION_COPY } from '@/content/cardfit-copy'
import { won } from '@/domain/cardfit/format'
import type { Calculation } from '@/domain/cardfit/types'

/**
 * UI-005 결론 상자 — 기준본 s5의 `#resultBox`.
 *
 * 앞세우는 값은 **현재 조합보다 얼마나 더 받는가**이고, 조합의 12개월 총 혜택은 뱃지로
 * 붙인다 (v0.5). 사용자가 결정할 것은 "바꿀 가치가 있는가"이고 그 답은 차액에 있다 —
 * 총액을 크게 띄우면 바꾸지 않아도 받을 몫까지 변경의 성과처럼 읽힌다.
 *
 * 두 값을 뒤집어 쓰지 않는다. 총액은 언제나 차액보다 크고, 어긋나면 화면이 스스로
 * 모순된다 — 실제로 라벨만 v0.5로 바꾸고 값을 그대로 둔 적이 있다.
 *
 * 유지 결론에서는 금액 대신 `현재 조합 유지`를 띄운다 — 바꾸지 않는 것이 결론이므로
 * 받을 금액을 앞세우면 변경을 권하는 것처럼 읽힌다 (`T21` · `T26`).
 */
export function BenefitSummary({
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
            <small>{copy.unit}</small> {won(chosen.gross_benefit)}
          </strong>
          <span className="benefit-delta">{copy.delta(won(chosen.gross_benefit_absolute))}</span>
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
