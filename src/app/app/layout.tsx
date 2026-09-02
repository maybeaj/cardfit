import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { PhoneShell } from '@/components/shell'
import { FlowProvider } from '@/state/store'

export const metadata: Metadata = {
  title: 'CardFit — 앞으로 쓸 돈으로 카드 조합 계산하기',
  description:
    '결혼·이사처럼 예정된 지출을 반영해 현재 카드를 유지할지 바꿀지 근거와 함께 확인합니다. 모든 수치는 예시입니다.',
}

/**
 * 앱 데모 흐름의 셸.
 *
 * 기준본(`docs/prototype/cardfit-prd-srs-v0.4.html`)은 결정론적 Mock이라 요청 시점에
 * 읽어야 할 외부 데이터가 없다. 화면 데이터는 `src/fixtures/prototype.ts`,
 * 계산은 `src/domain/scenario.ts`가 담당하고 둘 다 순수하다 (NFR-001).
 * 실연동 전환 지점은 `src/server/repository.ts` 하나로 남겨 둔다 (ADR-001 · D-001).
 */
export default function AppFlowLayout({ children }: { children: ReactNode }) {
  return (
    <FlowProvider>
      <PhoneShell>{children}</PhoneShell>
    </FlowProvider>
  )
}
