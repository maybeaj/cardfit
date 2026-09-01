import Link from 'next/link'
import type { ReactNode } from 'react'
import type { CardStatus } from '@/domain/types'

/** iPhone 17 402×874 프레임. 데스크톱에서는 중앙 정렬만 하고 정보 위계를 바꾸지 않는다. */
export function PhoneShell({ children }: { children: ReactNode }) {
  return <div className="phone">{children}</div>
}

export function ScreenHeader({
  step,
  title,
  lead,
  backHref,
}: {
  step?: string
  title: string
  lead?: string
  backHref?: string
}) {
  return (
    <header className="px-5 pt-6 pb-4">
      {backHref ? (
        <Link href={backHref} className="text-sm text-muted inline-block mb-3">
          ← 뒤로
        </Link>
      ) : null}
      {step ? (
        <p className="text-xs font-bold tracking-wide text-primary mb-2">{step}</p>
      ) : null}
      <h1 className="text-[22px] leading-[1.35] font-extrabold tracking-tight text-ink m-0">
        {title}
      </h1>
      {lead ? <p className="mt-2 mb-0 text-[14px] leading-relaxed text-muted">{lead}</p> : null}
    </header>
  )
}

export function Panel({
  children,
  tone = 'surface',
  className = '',
}: {
  children: ReactNode
  tone?: 'surface' | 'bg' | 'banner'
  className?: string
}) {
  const tones = {
    surface: 'bg-surface border border-line text-ink',
    bg: 'bg-bg border border-line text-ink',
    // 다크 영역은 결론 배너 하나뿐이다 (T13)
    banner: 'bg-banner text-white border border-banner',
  } as const
  return (
    <section className={`rounded-[var(--radius-card)] p-4 ${tones[tone]} ${className}`}>
      {children}
    </section>
  )
}

export function Notice({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'warning' | 'positive'
}) {
  const tones = {
    neutral: 'bg-bg text-muted',
    warning: 'bg-[#FFF8E8] text-warning',
    positive: 'bg-[#EAF7F1] text-positive',
  } as const
  return (
    <p className={`m-0 rounded-xl px-3 py-2 text-[12.5px] leading-relaxed ${tones[tone]}`}>
      {children}
    </p>
  )
}

export function StatusChip({ status }: { status: CardStatus }) {
  const tones: Record<CardStatus, string> = {
    신규: 'bg-primary text-white',
    유지: 'bg-[#E8F0FF] text-primary',
    정리: 'bg-[#F0F2F7] text-muted',
  }
  return (
    <span className={`inline-flex items-center rounded-lg px-2 py-1 text-[11px] font-bold ${tones[status]}`}>
      {status}
    </span>
  )
}

export function SampleBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[#F0F2F7] px-1.5 py-0.5 text-[10px] font-semibold text-muted">
      {label}
    </span>
  )
}

export function CtaBar({ children }: { children: ReactNode }) {
  return <div className="cta-bar">{children}</div>
}

const CTA_BASE =
  'block w-full rounded-[var(--radius-button)] px-4 py-[15px] text-center text-[16px] font-bold min-h-[52px] transition-opacity'

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
    <Link href={href} onClick={onClick} className={`${CTA_BASE} bg-primary text-white`}>
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
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${CTA_BASE} ${disabled ? 'bg-[#D8DEEA] text-[#98A1B0] cursor-not-allowed' : 'bg-primary text-white'}`}
    >
      {children}
    </button>
  )
}

export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="block w-full rounded-[var(--radius-button)] border border-line px-4 py-3 text-center text-[14px] font-semibold text-muted"
    >
      {children}
    </Link>
  )
}

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="m-0 text-[13px] text-muted">{label}</dt>
      <dd className="m-0 text-[14px] font-semibold text-ink tabular-nums">{value}</dd>
    </div>
  )
}
