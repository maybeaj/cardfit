import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * 앱 셸과 공통 블록 — `docs/prototype/cardfit-prd-srs-v0.4.html`이 기준본이다 (`D-011`).
 *
 * 클래스 이름과 치수를 기준본 CSS와 1:1로 맞춘다. 구현 화면이 기준본과 다르면 기준본이 옳다.
 * 한 화면 = 흰 패널 하나이고 버튼은 패널 맨 아래(`.actions`)에 붙는다.
 * 다크 영역은 결론 배너 하나뿐이며 탭 네비게이션은 그리지 않는다 (`T13` · `T14`).
 */

/** iPhone 17 목업 — 402×900 프레임 안에서 872px 화면이 스크롤된다. */
export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <div className="device" aria-label="CardFit 앱 화면">
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
        </div>
      </div>
      <p className="device-caption">iPhone 17 logical viewport · 402 × 874</p>
    </div>
  )
}

/**
 * 한 화면. 패널 하나를 담고 세로로 늘어난다.
 *
 * `screenId`는 기준본의 `#s0`~`#s6`이다 — 화면별 CSS가 이 값을 잡는다.
 * `back`이 있으면 패널 위에 뒤로가기가 붙는다. 온보딩·동의 화면에는 없다.
 */
export function Screen({
  children,
  screenId,
  back,
}: {
  children: ReactNode
  screenId?: string
  back?: string
}) {
  return (
    <section className="screen active" data-screen={screenId}>
      {back ? (
        <div className="app-nav">
          <Link className="app-back" href={back} aria-label="이전 화면으로 돌아가기">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5 8 12l7 7" />
            </svg>
          </Link>
        </div>
      ) : null}
      <div className="panel">{children}</div>
    </section>
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

export function GhostLink({
  href,
  children,
  onClick,
}: {
  href: string
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <Link href={href} className="ghost" onClick={onClick}>
      {children}
    </Link>
  )
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
  ...rest
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  'aria-pressed'?: boolean
}) {
  return (
    <button
      type="button"
      className={className ? `primary ${className}` : 'primary'}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button type="button" className="secondary" onClick={onClick}>
      {children}
    </button>
  )
}

export function GhostButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button type="button" className="ghost" onClick={onClick} disabled={disabled}>
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
