import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'
import type { CardStatus } from '@/domain/cardfit/types'

/**
 * 앱 셸과 공통 블록 — `docs/prototype/cardfit-prd-srs-v0.4.html`이 기준본이다 (`D-011`).
 *
 * 클래스 이름과 치수를 기준본 CSS와 1:1로 맞춘다. 구현 화면이 기준본과 다르면 기준본이 옳다.
 * 한 화면 = 흰 패널 하나이고 버튼은 패널 맨 아래(`.actions`)에 붙는다.
 * 다크 영역은 쓰지 않는다 — 결론의 신호값은 명도가 아니라 의미색이 담당한다.
 */

/** 실제 모바일 웹 셸 — 작은 화면은 전체 폭, 넓은 화면은 430px로 중앙 정렬한다. */
export function PhoneShell({ children }: { children: ReactNode }) {
  return <main className="mobile-shell">{children}</main>
}

/** 한 화면. 패널 하나를 담고 세로로 늘어난다. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <section className="screen">
      <div className="panel">{children}</div>
    </section>
  )
}

/**
 * 화면 제목. 기준본은 패널 안에서 배지를 감춘다 (`.device .panel>.badge{display:none}`).
 *
 * 뒤로 가기는 글자 없이 아이콘만 둔다 — 모바일에서 통용되는 기호라 설명이 필요 없고,
 * 제목 위에 글자가 얹히면 화면의 첫 줄이 제목이 아니게 된다.
 * 화면 낭독기에는 `aria-label`로 이름을 준다.
 */
export function ScreenHeader({
  title,
  lead,
  backHref,
}: {
  /**
   * 배열이면 줄바꿈으로 잇는다 — 기준본이 `h2`를 `<br>`로 끊는다.
   * 결과 화면처럼 제목이 없는 화면도 있다 — 결론 배너가 제목 역할을 한다.
   */
  title?: ReactNode | readonly string[]
  lead?: ReactNode
  backHref?: string
}) {
  const heading = Array.isArray(title)
    ? (title as readonly string[]).map((line, index) => (
        <Fragment key={line}>
          {index > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))
    : (title as ReactNode)
  return (
    <>
      {backHref ? (
        <Link href={backHref} className="back-link" aria-label="이전 화면으로">
          <svg viewBox="0 0 24 24" aria-hidden focusable="false">
            <path
              d="M15 5 8 12l7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      ) : null}
      {title ? <h2>{heading}</h2> : null}
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
