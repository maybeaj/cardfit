/** 금액은 정수 원 단위로 계산하고 화면 표시 직전에만 포맷한다 (TECH_SPEC 5절). */

/**
 * 기준본의 `won()` — 앱 화면은 `₩` 기호 표기를 쓴다 (`D-011`).
 * 아래 `won()`(`n원`)은 도메인 테스트와 서버 계약이 쓰던 표기라 함께 남겨둔다.
 */
export function krw(amount: number): string {
  return `₩${Math.round(amount).toLocaleString('ko-KR')}`
}

export function won(amount: number): string {
  return `${Math.round(amount).toLocaleString('ko-KR')}원`
}

export function manwon(amount: number): string {
  const value = amount / 10_000
  const rounded = Number.isInteger(value) ? value : Number(value.toFixed(1))
  return `${rounded.toLocaleString('ko-KR')}만원`
}

export function percent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

export function monthLabel(asOf: string, offset: number): string {
  const base = new Date(`${asOf}T00:00:00Z`)
  base.setUTCMonth(base.getUTCMonth() + offset)
  return `${base.getUTCFullYear()}.${String(base.getUTCMonth() + 1).padStart(2, '0')}`
}
