import Link from 'next/link'
import type { ReactNode } from 'react'
import type { CardStatus } from '@/domain/types'

/**
 * 앱 셸과 공통 블록 — `docs/prototype/cardfit-prd-srs-v0.4.html`이 기준본이다 (`D-011`).
 *
 * 클래스 이름과 치수를 기준본 CSS와 1:1로 맞춘다. 구현 화면이 기준본과 다르면 기준본이 옳다.
 * 한 화면 = 흰 패널 하나이고 버튼은 패널 맨 아래(`.actions`)에 붙는다.
 * 다크 영역은 쓰지 않는다 — 결론의 신호값은 명도가 아니라 의미색이 담당한다.
 */

/** iPhone 17 목업 — 402×900 프레임 안에서 872px 화면이 스크롤된다. */
export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="py-7">
      <div className="device" aria-label="iPhone 17 목업">
        <div className="island" aria-hidden />
        <div className="device-screen">
          <div className="statusbar">
            <span>9:41</span>
            <span className="status-icons">
              <span>5G</span>
              <span aria-hidden>▮▮▮</span>
              <span aria-hidden>▰</span>
            </span>
          </div>
          {children}
          <div className="homebar" aria-hidden />
        </div>
      </div>
      <p className="device-caption">iPhone 17 logical viewport · 402 × 874</p>
    </div>
  )
}

/** 한 화면. 패널 하나를 담고 세로로 늘어난다. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <section className="screen">
      <div className="panel">{children}</div>
    </section>
  )
}

export function ScreenHeader({
  step,
  title,
  lead,
  backHref,
}: {
  step?: string
  title: ReactNode
  lead?: ReactNode
  backHref?: string
}) {
  return (
    <>
      {backHref ? (
        <Link href={backHref} className="mb-1 inline-block text-[11px] text-[var(--color-subtle)]">
          ← 뒤로
        </Link>
      ) : null}
      {step ? <span className="badge">{step}</span> : null}
      <h2>{title}</h2>
      {lead ? <p className="sub">{lead}</p> : null}
    </>
  )
}

/** 버튼 묶음. 패널 맨 아래에 붙는다 — 탭 네비게이션을 그리지 않는다 (`T14`). */
export function Actions({ children }: { children: ReactNode }) {
  return <div className="actions">{children}</div>
}

export function PrimaryLink({
  href,
  children,
  onClick,
}: {
  href: string
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <Link href={href} className="primary" onClick={onClick}>
      {children}
    </Link>
  )
}

export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="secondary">
      {children}
    </Link>
  )
}

export function GhostLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="ghost">
      {children}
    </Link>
  )
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <button type={type} className="primary" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button type="button" className="secondary" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

/** 안내(`.note`, 파랑)와 주의(`.notice`, 앰버). 입력을 되돌릴 때만 `.error`를 쓴다. */
export function Note({ children }: { children: ReactNode }) {
  return <div className="note">{children}</div>
}

export function Notice({ children }: { children: ReactNode }) {
  return <div className="notice">{children}</div>
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return <div className="error">{children}</div>
}

export function Metric({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className ? `metric ${className}` : 'metric'}>
      <span>{label}</span>
      {children}
    </div>
  )
}

export function StatusChip({ status }: { status: CardStatus }) {
  return <span className="tag">{status}</span>
}

export function SampleBadge({ label }: { label: string }) {
  return <span className="category-tag">{label}</span>
}

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--color-line)] py-1.5 last:border-b-0">
      <dt className="m-0 text-[11px] text-[var(--color-subtle)]">{label}</dt>
      <dd className="m-0 text-[11px] font-semibold text-[var(--color-ink)] tabular-nums">
        {value}
      </dd>
    </div>
  )
}
