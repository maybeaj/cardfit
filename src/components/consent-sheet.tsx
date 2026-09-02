'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { CONSENT_COPY, DATA_NOTICE } from '@/content/copy'
import { Button } from '@/components/ui/button'

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
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    sheetRef.current?.querySelector<HTMLInputElement>('input[type="checkbox"]')?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const toggleAll = (next: boolean) => {
    setChecked(Object.fromEntries(CONSENT_COPY.items.map((item) => [item.id, next])))
  }

  return (
    <div
      className="absolute inset-0 z-20 flex items-end justify-center bg-ink/40"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-in slide-in-from-bottom relative max-h-[88%] w-full overflow-y-auto rounded-t-[26px] bg-surface px-[18px] pt-[18px] pb-[calc(20px+env(safe-area-inset-bottom))] duration-300"
      >
        <div className="mx-auto mb-3.5 h-1 w-[38px] rounded-full bg-line" />
        <button
          type="button"
          onClick={onClose}
          aria-label={CONSENT_COPY.close}
          className="absolute top-3.5 right-3.5 grid h-[30px] w-[30px] place-items-center rounded-full bg-bg text-[20px] leading-none text-subtle"
        >
          ×
        </button>

        <p className="m-0 mb-1.5 text-[10px] font-black tracking-[0.08em] text-primary">
          {CONSENT_COPY.eyebrow}
        </p>
        <h2 id={titleId} className="m-0 mr-8 mb-1 text-[20px] leading-[1.3] font-extrabold text-ink">
          {CONSENT_COPY.title}
        </h2>
        <p className="mt-0 mb-3 text-[11px] leading-[1.45] text-subtle">{CONSENT_COPY.lead}</p>

        {[CONSENT_COPY.purpose, CONSENT_COPY.scope].map((row) => (
          <div
            key={row.label}
            className="my-1.5 grid grid-cols-[58px_minmax(0,1fr)] gap-2 rounded-[10px] bg-bg px-2.5 py-2.5 text-[10px] leading-[1.4]"
          >
            <b className="text-[10px] text-ink">{row.label}</b>
            <span className="text-subtle">{row.body}</span>
          </div>
        ))}

        <div className="mt-3 border-t border-line">
          <label className="my-2 grid cursor-pointer grid-cols-[20px_minmax(0,1fr)] items-center gap-2 rounded-[10px] border border-[#dbe7fb] bg-primary-soft/50 p-2.5">
            <input
              type="checkbox"
              checked={allChecked}
              ref={(node) => {
                if (node) node.indeterminate = someChecked && !allChecked
              }}
              onChange={(event) => toggleAll(event.target.checked)}
              className="h-[17px] w-[17px] accent-primary"
            />
            <span className="min-w-0">
              <b className="block text-[12px] text-ink">{CONSENT_COPY.allLabel}</b>
              <small className="mt-0.5 block text-[9px] leading-[1.4] text-subtle">
                {CONSENT_COPY.allBody}
              </small>
            </span>
          </label>

          {CONSENT_COPY.items.map((item) => (
            <label
              key={item.id}
              className="grid cursor-pointer grid-cols-[20px_minmax(0,1fr)_auto] items-start gap-2 border-b border-[#edf1f5] py-2.5 text-[11px] leading-[1.35]"
            >
              <input
                type="checkbox"
                checked={Boolean(checked[item.id])}
                onChange={(event) =>
                  setChecked((prev) => ({ ...prev, [item.id]: event.target.checked }))
                }
                className="my-px h-[17px] w-[17px] accent-primary"
              />
              <span className="min-w-0">
                <b className="block text-[11px] text-ink">{item.title}</b>
                <small className="mt-0.5 block text-[9px] leading-[1.4] text-subtle">
                  {item.body}
                </small>
              </span>
              {/* 약관 전문은 실연동 범위다. 없는 문서를 있는 것처럼 열지 않는다 */}
              <span className="mt-0.5 text-[9px] whitespace-nowrap text-subtle">
                {CONSENT_COPY.detailLink}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-2.5 flex justify-between gap-2.5 rounded-[10px] bg-bg p-2.5 text-[10px]">
          <b className="text-ink">{CONSENT_COPY.termLabel}</b>
          <span className="text-subtle">{CONSENT_COPY.termBody}</span>
        </div>

        <p className="mt-2.5 mb-3 text-[9px] leading-[1.45] text-subtle">
          {CONSENT_COPY.legalNote}
        </p>
        <p className="mt-0 mb-3 text-[10px] font-semibold text-primary">{DATA_NOTICE.mockOnly}</p>

        <Button
          size="lg"
          disabled={!allChecked}
          onClick={onAccept}
          className="min-h-[44px] w-full rounded-[var(--radius-button)] text-[12px] font-bold"
        >
          {CONSENT_COPY.submit}
        </Button>
      </div>
    </div>
  )
}
