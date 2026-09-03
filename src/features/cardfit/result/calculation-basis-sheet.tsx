'use client'

import Link from 'next/link'
import { BASIS_COPY } from '@/content/cardfit-copy'
import { won } from '@/domain/cardfit/format'
import type { PlanCandidate } from '@/domain/cardfit/types'
import { BottomSheet, useSheetTitleId } from '@/components/overlay/bottom-sheet'

/**
 * UI-007 계산 기준 요약 — 기준본 s5의 `#resultEvidenceModal`.
 *
 * **전체 근거 화면과 다른 화면이다.** 결론 카드의 `계산 기준 보기`가 여는 시트이고,
 * 여기서 답하는 질문은 하나다 — *"이 금액이 어디서 왔나"*. 총 혜택에서 무엇을 빼서
 * 결론에 닿았는지 다섯 줄로 보이고 끝낸다.
 *
 * 카드별 실적구간 표와 제외조건은 여기 넣지 않는다. 넣으면 결과를 보다 말고 약관을
 * 읽게 되고, 그럴 거면 `/app/evidence`가 따로 있을 이유가 없다. 더 보고 싶은 사람만
 * `전체 근거 보기`로 넘어간다.
 */
export function CalculationBasisSheet({
  open,
  onClose,
  candidate,
  scenarioLabel,
  pass,
}: {
  open: boolean
  onClose: () => void
  /** 결론 조합. 유지 결론이면 현재 조합이 들어온다 */
  candidate: PlanCandidate
  scenarioLabel: string
  pass: boolean
}) {
  const titleId = useSheetTitleId()
  const cost = candidate.switching_cost

  /*
   * 0원인 항목은 줄에서 뺀다. `− ₩0`을 늘어놓으면 실제로 빠진 비용이 무엇인지 흐려진다.
   * 다만 총 혜택과 추가 혜택은 0이어도 남긴다 — 결론의 근거라 없으면 계산이 끊긴다.
   */
  const deductions = [
    [BASIS_COPY.lines.annualFee, cost.annual_fee],
    [BASIS_COPY.lines.requalificationLoss, cost.requalification_loss],
    [BASIS_COPY.lines.issuanceWaitCost, cost.issuance_wait_cost],
  ] as const

  return (
    <BottomSheet open={open} onClose={onClose} labelledBy={titleId} className="evidence-sheet">
      <BottomSheet.Header
        id={titleId}
        eyebrow={BASIS_COPY.eyebrow}
        title={BASIS_COPY.title}
        lead={BASIS_COPY.lead}
        onClose={onClose}
        closeLabel={BASIS_COPY.closeSheet}
      />

      <div className="evidence-summary">
        <span>
          {pass
            ? BASIS_COPY.summaryLabel(scenarioLabel)
            : BASIS_COPY.holdSummaryLabel(scenarioLabel)}
        </span>
        <strong className="tabular-nums">{won(candidate.gross_benefit_absolute)}</strong>
      </div>

      <div className="evidence-lines">
        <div className="evidence-line">
          <b>{BASIS_COPY.lines.increase}</b>
          <span className="tabular-nums">{won(candidate.gross_benefit)}</span>
        </div>
        {deductions
          .filter(([, amount]) => amount > 0)
          .map(([label, amount]) => (
            <div key={label} className="evidence-line">
              <b>{label}</b>
              <span className="tabular-nums">− {won(amount)}</span>
            </div>
          ))}
        <div className="evidence-line">
          <b>{BASIS_COPY.lines.horizon}</b>
          <span>{BASIS_COPY.horizonValue}</span>
        </div>
      </div>

      <BottomSheet.Actions>
        <button type="button" className="secondary" onClick={onClose}>
          {BASIS_COPY.close}
        </button>
        <Link className="primary" href="/app/evidence">
          {BASIS_COPY.full}
        </Link>
      </BottomSheet.Actions>
    </BottomSheet>
  )
}
