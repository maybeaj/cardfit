'use client'

import { Fragment, useEffect, useState } from 'react'
import { CONSENT_COPY } from '@/content/cardfit-copy'
import { BottomSheet, useSheetTitleId } from '@/components/overlay/bottom-sheet'

/**
 * UI-012 마이데이터 이용 동의 — 기준본 `#consentModal`의 최종 상태.
 *
 * 별도 화면이 아니라 온보딩 위로 올라오는 시트다 (`P04-R2`). 필수 2항목을 모두
 * 선택해야 CTA가 열린다.
 *
 * 상세를 **`전문 보기` 링크가 아니라 그 자리에서 펼치는 것**이 이 화면의 요점이다.
 * 링크로 빼면 실연동에나 있을 약관 문서를 있는 것처럼 걸게 되고, 사용자는 무엇에
 * 동의하는지 모른 채 체크한다. 이용 목적·항목·보유 기간을 시트 안에서 읽고 체크한다.
 *
 * 실제 인증·전송요구·동의 기록은 하지 않는다 (`D-001` · `T8`).
 */
export function MydataConsentSheet({
  open,
  onClose,
  onAccept,
}: {
  open: boolean
  onClose: () => void
  onAccept: () => void
}) {
  const titleId = useSheetTitleId()
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  // 닫으면 선택을 지운다. 다시 열었을 때 이전 동의가 남아 있으면 안 된다
  useEffect(() => {
    if (!open) setChecked({})
  }, [open])

  const allChecked = CONSENT_COPY.items.every((item) => checked[item.id])
  const someChecked = CONSENT_COPY.items.some((item) => checked[item.id])

  return (
    <BottomSheet open={open} onClose={onClose} labelledBy={titleId} className="consent-sheet">
      <BottomSheet.Header
        id={titleId}
        eyebrow={CONSENT_COPY.eyebrow}
        title={CONSENT_COPY.title.map((line, index) => (
          <Fragment key={line}>
            {index > 0 ? <br /> : null}
            {line}
          </Fragment>
        ))}
        lead={CONSENT_COPY.lead}
        onClose={onClose}
        closeLabel={CONSENT_COPY.closeSheet}
      />

      <div className="consent-items compact-consent">
        <label className="consent-all">
          <input
            type="checkbox"
            checked={allChecked}
            ref={(node) => {
              if (node) node.indeterminate = someChecked && !allChecked
            }}
            onChange={(event) =>
              setChecked(
                Object.fromEntries(
                  CONSENT_COPY.items.map((item) => [item.id, event.target.checked]),
                ),
              )
            }
          />
          <span>
            <b>{CONSENT_COPY.allLabel}</b>
          </span>
        </label>

        {CONSENT_COPY.items.map((item) => (
          <div key={item.id} className="consent-row">
            <label>
              <input
                type="checkbox"
                className="required-consent"
                checked={Boolean(checked[item.id])}
                onChange={(event) =>
                  setChecked((prev) => ({ ...prev, [item.id]: event.target.checked }))
                }
              />
              <span>
                <b>
                  <em>{CONSENT_COPY.required}</em> {item.title}
                </b>
              </span>
            </label>
            <details>
              <summary aria-label={CONSENT_COPY.detailLabel(item.title)}>›</summary>
              <div className="consent-detail-body">
                <b>{item.detailTitle}</b>
                <dl>
                  {item.rows.map(([term, description]) => (
                    <div key={term}>
                      <dt>{term}</dt>
                      <dd>{description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </details>
          </div>
        ))}
      </div>

      <p className="consent-reassurance">{CONSENT_COPY.reassurance}</p>
      <p className="legal-note">
        <b>{CONSENT_COPY.legalNoteLabel}</b>
        {CONSENT_COPY.legalNote}
      </p>

      <button type="button" className="primary sheet-submit" disabled={!allChecked} onClick={onAccept}>
        {CONSENT_COPY.submit}
      </button>
    </BottomSheet>
  )
}
