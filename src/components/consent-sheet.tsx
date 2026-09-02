'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { CONSENT_COPY, DATA_NOTICE } from '@/content/copy'

/**
 * UI-012 마이데이터 이용 동의 바텀시트 — 기준본 `#consentModal`.
 *
 * 별도 화면이 아니라 온보딩 위에 올라오는 시트다. 실제 서비스와 같은 이름
 * `마이데이터 이용 동의하기`를 쓰되(`P04-R2`), 화면 안에 프로토타입 고지를 함께 둔다.
 * 필수 3항목을 모두 선택해야 CTA가 열린다 — 실제 본인인증·전송요구는 하지 않는다.
 */
export function ConsentSheet({
  open,
  onClose,
  onAccept,
}: {
  open: boolean
  onClose: () => void
  onAccept: () => void
}) {
  const titleId = useId()
  const sheetRef = useRef<HTMLDivElement>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const allChecked = CONSENT_COPY.items.every((item) => checked[item.id])
  const someChecked = CONSENT_COPY.items.some((item) => checked[item.id])

  // 시트가 닫히면 선택을 지운다. 다시 열었을 때 이전 동의가 남아 있으면 안 된다
  useEffect(() => {
    if (!open) setChecked({})
  }, [open])

  useEffect(() => {
    if (!open) return
    const screen = document.querySelector('.device-screen')
    screen?.classList.add('modal-open')

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    sheetRef.current?.querySelector<HTMLInputElement>('input[type="checkbox"]')?.focus()

    return () => {
      screen?.classList.remove('modal-open')
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const toggleAll = (next: boolean) => {
    setChecked(Object.fromEntries(CONSENT_COPY.items.map((item) => [item.id, next])))
  }

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
        className="consent-sheet"
      >
        <div className="sheet-handle" />
        <button
          type="button"
          className="sheet-close"
          onClick={onClose}
          aria-label={CONSENT_COPY.close}
        >
          ×
        </button>

        <div className="sheet-eyebrow">{CONSENT_COPY.eyebrow}</div>
        <h2 id={titleId}>{CONSENT_COPY.title}</h2>
        <p className="sheet-sub">{CONSENT_COPY.lead}</p>

        {[CONSENT_COPY.purpose, CONSENT_COPY.scope].map((row) => (
          <div key={row.label} className="consent-purpose">
            <b>{row.label}</b>
            <span>{row.body}</span>
          </div>
        ))}

        <div className="consent-items">
          <label className="consent-all">
            <input
              type="checkbox"
              checked={allChecked}
              ref={(node) => {
                if (node) node.indeterminate = someChecked && !allChecked
              }}
              onChange={(event) => toggleAll(event.target.checked)}
            />
            <span>
              <b>{CONSENT_COPY.allLabel}</b>
              <small>{CONSENT_COPY.allBody}</small>
            </span>
          </label>

          {CONSENT_COPY.items.map((item) => (
            <label key={item.id}>
              <input
                type="checkbox"
                checked={Boolean(checked[item.id])}
                onChange={(event) =>
                  setChecked((prev) => ({ ...prev, [item.id]: event.target.checked }))
                }
              />
              <span>
                <b>{item.title}</b>
                <small>{item.body}</small>
              </span>
              {/* 약관 전문은 실연동 범위다. 없는 문서를 있는 것처럼 열지 않는다 */}
              <span className="detail-link">{CONSENT_COPY.detailLink}</span>
            </label>
          ))}
        </div>

        <div className="consent-term">
          <b>{CONSENT_COPY.termLabel}</b>
          <span>{CONSENT_COPY.termBody}</span>
        </div>

        <p className="legal-note">{CONSENT_COPY.legalNote}</p>
        <p className="legal-note" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
          {DATA_NOTICE.mockOnly}
        </p>

        <button type="button" className="sheet-submit" disabled={!allChecked} onClick={onAccept}>
          {CONSENT_COPY.submit}
        </button>
      </div>
    </div>
  )
}
