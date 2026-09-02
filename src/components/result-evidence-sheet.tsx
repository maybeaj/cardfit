'use client'

import { useEffect, useId } from 'react'
import { RESULT_EVIDENCE_COPY } from '@/content/copy'
import { krw } from '@/domain/format'
import type { Outcome } from '@/domain/scenario'

/**
 * UI-007 요약 근거 — 기준본 `#resultEvidenceModal`.
 *
 * 결론 화면에서만 열린다. 금액을 크게 보여주기 전에 그 금액이 어디서 왔는지 한 화면에서 밝힌다.
 * 여기서 `전체 근거 보기`로 상세 근거 화면(s6)에 들어간다.
 */
export function ResultEvidenceSheet({
  outcome,
  open,
  onClose,
  onOpenFull,
}: {
  outcome: Outcome
  open: boolean
  onClose: () => void
  onOpenFull: () => void
}) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const screen = document.querySelector('.device-screen')
    screen?.classList.add('modal-open')

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    return () => {
      screen?.classList.remove('modal-open')
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  /*
   * 비용 3종을 각각 보여준다 — 합계만 보여주면 사용자가 어느 항목이 큰지 대조할 수 없다.
   * 미반영 항목의 금액은 여기에 합산하지 않는다 (`T7`).
   */
  const lines: [string, string][] = [
    [RESULT_EVIDENCE_COPY.lineIncrease, krw(outcome.benefitIncrease)],
    [RESULT_EVIDENCE_COPY.lineFee, `− ${krw(outcome.fee)}`],
    [RESULT_EVIDENCE_COPY.lineRequalification, `− ${krw(outcome.requalificationLoss)}`],
    [RESULT_EVIDENCE_COPY.lineWait, `− ${krw(outcome.issuanceWait)}`],
    [RESULT_EVIDENCE_COPY.lineHorizon, RESULT_EVIDENCE_COPY.horizonValue],
  ]

  return (
    <div
      className="consent-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="consent-sheet evidence-sheet"
      >
        <div className="sheet-handle" />
        <button
          type="button"
          className="sheet-close"
          onClick={onClose}
          aria-label={RESULT_EVIDENCE_COPY.close}
        >
          ×
        </button>

        <div className="sheet-eyebrow">{RESULT_EVIDENCE_COPY.eyebrow}</div>
        <h2 id={titleId}>{RESULT_EVIDENCE_COPY.title}</h2>
        <p className="sheet-sub">{RESULT_EVIDENCE_COPY.lead}</p>

        <div className="evidence-summary">
          <span>{RESULT_EVIDENCE_COPY.summaryLabel(outcome.label)}</span>
          <strong>{krw(outcome.displayBenefit)}</strong>
        </div>

        <div className="evidence-lines">
          {lines.map(([label, value]) => (
            <div key={label} className="evidence-line">
              <b>{label}</b>
              <span>{value}</span>
            </div>
          ))}
        </div>

        <div className="sheet-actions">
          <button type="button" className="ghost" onClick={onClose}>
            {RESULT_EVIDENCE_COPY.close}
          </button>
          <button type="button" className="secondary" onClick={onOpenFull}>
            {RESULT_EVIDENCE_COPY.full}
          </button>
        </div>
      </div>
    </div>
  )
}
