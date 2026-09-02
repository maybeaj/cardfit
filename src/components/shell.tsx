import Link from 'next/link'
import type { ReactNode } from 'react'
import type { CardStatus } from '@/domain/types'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/**
 * 앱 셸과 공통 블록. 프리미티브는 shadcn/ui를 쓰고(`C-TEC-004`) 여기서는
 * CardFit 고유의 배치 규칙만 얹는다 — 402×874 프레임, 하단 고정 CTA 하나, 다크 영역 1개.
 */

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
        <Link href={backHref} className="mb-3 inline-block text-sm text-muted">
          ← 뒤로
        </Link>
      ) : null}
      {step ? <p className="mb-2 text-xs font-bold tracking-wide text-primary">{step}</p> : null}
      <h1 className="m-0 text-[22px] leading-[1.35] font-extrabold tracking-tight text-ink">
        {title}
      </h1>
      {lead ? <p className="mt-2 mb-0 text-[14px] leading-relaxed text-muted">{lead}</p> : null}
    </header>
  )
}

export function Panel({
  children,
  tone = 'surface',
  className,
}: {
  children: ReactNode
  tone?: 'surface' | 'bg' | 'banner'
  className?: string
}) {
  const tones = {
    surface: 'bg-surface border-line text-ink',
    bg: 'bg-bg border-line text-ink',
    // 다크 영역은 결론 배너 하나뿐이다 (T13)
    banner: 'bg-banner border-banner text-white',
  } as const
  return (
    <Card
      className={cn('gap-0 rounded-[var(--radius-card)] border py-0 shadow-none', tones[tone], className)}
    >
      <CardContent className="px-4 py-4">{children}</CardContent>
    </Card>
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
    neutral: 'bg-bg text-muted border-transparent',
    warning: 'bg-[#FFF8E8] text-warning border-transparent',
    positive: 'bg-[#EAF7F1] text-positive border-transparent',
  } as const
  return (
    <Alert className={cn('grid-cols-1 gap-0 rounded-xl px-3 py-2', tones[tone])}>
      <AlertDescription className="text-[12.5px] leading-relaxed text-inherit">
        {children}
      </AlertDescription>
    </Alert>
  )
}

export function StatusChip({ status }: { status: CardStatus }) {
  const tones: Record<CardStatus, string> = {
    신규: 'bg-primary text-white border-transparent',
    유지: 'bg-[#E8F0FF] text-primary border-transparent',
    정리: 'bg-[#F0F2F7] text-muted border-transparent',
  }
  return (
    <Badge className={cn('rounded-lg px-2 py-1 text-[11px] font-bold', tones[status])}>
      {status}
    </Badge>
  )
}

export function SampleBadge({ label }: { label: string }) {
  return (
    <Badge
      variant="secondary"
      className="rounded-md bg-[#F0F2F7] px-1.5 py-0.5 text-[10px] font-semibold text-muted"
    >
      {label}
    </Badge>
  )
}

/** 화면 하단은 고정 CTA 하나가 차지한다. 탭 네비게이션을 그리지 않는다 (T14). */
export function CtaBar({ children }: { children: ReactNode }) {
  return <div className="cta-bar">{children}</div>
}

const CTA = 'w-full min-h-[52px] rounded-[var(--radius-button)] text-[16px] font-bold'

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
    <Button asChild size="lg" className={CTA}>
      <Link href={href} onClick={onClick}>
        {children}
      </Link>
    </Button>
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
    <Button type={type} size="lg" onClick={onClick} disabled={disabled} className={CTA}>
      {children}
    </Button>
  )
}

export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button asChild variant="outline" size="lg" className={cn(CTA, 'text-[14px] text-muted')}>
      <Link href={href}>{children}</Link>
    </Button>
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
