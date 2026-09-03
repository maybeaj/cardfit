'use client'

import { useEffect, useId, useRef } from 'react'
import { CONCLUSION_COPY, EVIDENCE_COPY } from '@/content/copy'
import { won } from '@/domain/format'
import type { Calculation, Profile } from '@/domain/types'
import { EvidenceDetails } from '@/components/evidence-details'

/**
 * UI-007 근거 — 기준본 s5의 `#resultEvidenceModal`.
 *
 * 결론 상자의 `근거 보기`가 결과 화면 위에 시트로 연다. 별도 화면으로 넘기지 않는 이유는
 * 금액을 보던 자리에서 곧바로 이유를 확인하고 되돌아오기 위해서다 — 화면을 옮기면
 * 어떤 시나리오의 금액을 보고 있었는지 맥락이 끊긴다.
 *
 * 내용은 `/app/evidence` 화면과 같은 `EvidenceDetails`를 그대로 쓴다. 근거를 두 벌로
 * 관리하면 한쪽만 고쳐져 서로 다른 근거를 보여주게 된다.
 */
export function EvidenceSheet({
  open,
  onClose,
  calculation,
  profile,
  scenarioLabel,
}: {
  open: boolean
  onClose: () => void
  calculation: Calculation
  profile: Profile
  scenarioLabel: string
}) {
  const titleId = useId()
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const shell = document.querySelector('.mobile-shell')
    shell?.classList.add('modal-open')

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    sheetRef.current?.focus()

    return () => {
      shell?.classList.remove('modal-open')
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const pass = calculation.decision === '변경'
  const shown = pass ? calculation.chosen : calculation.current

  return (
    <div
      className="consent-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="consent-sheet"
      >
        <div className="sheet-handle" />
        <button
          type="button"
          className="sheet-close"
          onClick={onClose}
          aria-label={CONCLUSION_COPY.benefit.close}
        >
          ×
        </button>

        {/* 어떤 시나리오의 금액을 설명하는 근거인지 먼저 밝힌다 */}
        <div className="evidence-sheet-summary" id={titleId}>
          <span>{CONCLUSION_COPY.benefit.sheetTitle(scenarioLabel)}</span>
          <strong className="tabular-nums">
            {pass ? won(shown.gross_benefit_absolute) : CONCLUSION_COPY.benefit.holdValue}
          </strong>
        </div>

        {calculation.stale_as_of_warning ? (
          <div className="notice">{EVIDENCE_COPY.staleAsOf}</div>
        ) : null}

        <EvidenceDetails calculation={calculation} profile={profile} candidate={shown} />

        <div className="notice">{EVIDENCE_COPY.notice}</div>
        <p className="footer">{EVIDENCE_COPY.disclaimer}</p>
      </div>
    </div>
  )
}
