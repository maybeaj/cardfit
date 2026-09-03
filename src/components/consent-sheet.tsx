'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { CONSENT_COPY, DATA_NOTICE } from '@/content/copy'

/**
 * UI-012 마이데이터 이용 동의 바텀시트 — 기준본 `#consentModal`.
 *
 * 별도 화면이 아니라 온보딩 위에 올라오는 시트다. 첫 화면에는 동의 항목만
 * 간결하게 보여주고, 상세 고지는 각 항목을 펼쳤을 때 확인한다.
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

  const requiredItems = CONSENT_COPY.items.slice(0, 2)
  const allChecked = requiredItems.every((item) => checked[item.id])
  const someChecked = requiredItems.some((item) => checked[item.id])

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
    setChecked(Object.fromEntries(requiredItems.map((item) => [item.id, next])))
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

        <div className="consent-items compact-consent">
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
            </span>
          </label>

          {requiredItems.map((item) => (
            <details key={item.id} className="consent-row">
              <summary>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(checked[item.id])}
                    onChange={(event) =>
                      setChecked((prev) => ({ ...prev, [item.id]: event.target.checked }))
                    }
                    onClick={(event) => event.stopPropagation()}
                  />
                  <span><b><em>필수</em> {item.title.replace(/^\[필수\]\s*/, '')}</b></span>
                </label>
                <span aria-hidden>›</span>
              </summary>
              <div className="consent-detail-body">
                <b>상세 안내</b>
                <p>{item.body}</p>
                <p>정확한 정보 항목과 보유 기간은 연결한 기관의 약관에서 확인할 수 있습니다.</p>
              </div>
            </details>
          ))}
        </div>
        <p className="consent-reassurance">언제든지 마이데이터 연결을 해제할 수 있어요.</p>
        <p className="legal-note">{DATA_NOTICE.mockOnly}. 실제 전송기관과 정보 항목은 서비스 정책에 따라 달라질 수 있습니다.</p>

        <button type="button" className="sheet-submit" disabled={!allChecked} onClick={onAccept}>
          {CONSENT_COPY.submit}
        </button>
      </div>
    </div>
  )
}
