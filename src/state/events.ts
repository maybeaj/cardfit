/**
 * ClientEvent 6종 (T30) — 북극성(조합안 확정률) 측정 근거.
 * Mock이라 서버로 전송하지 않고 콘솔과 localStorage에만 남긴다.
 */
export const EVENT_TYPES = [
  '입력완료',
  '계산요청',
  '결과열람',
  '근거열람',
  '조합확정',
  '아웃링크클릭',
] as const

export type ClientEventType = (typeof EVENT_TYPES)[number]

export interface ClientEvent {
  event_type: ClientEventType
  timestamp: string
  payload?: Record<string, string | number | boolean>
}

const KEY = 'cardfit.events'

export function logEvent(event_type: ClientEventType, payload?: ClientEvent['payload']): void {
  const event: ClientEvent = { event_type, timestamp: new Date().toISOString(), payload }
  if (typeof window === 'undefined') return
  console.info('[ClientEvent]', event.event_type, event.payload ?? {})
  try {
    const raw = window.localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as ClientEvent[]) : []
    list.push(event)
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(-200)))
  } catch {
    // 저장 실패는 흐름을 막지 않는다
  }
}

export function readEvents(): ClientEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ClientEvent[]) : []
  } catch {
    return []
  }
}
