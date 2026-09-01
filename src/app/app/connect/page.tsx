'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DATA_NOTICE } from '@/content/copy'
import { CtaBar, Notice, Panel, PrimaryButton, ScreenHeader } from '@/components/ui'
import { useDemo } from '@/state/store'

/** UI-012 마이데이터 안내 — 실제 인증·동의·연결 성공 표현 0건 (AC-011). */
export default function ConnectScreen() {
  const router = useRouter()
  const { connect } = useDemo()
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle')

  const start = () => {
    setPhase('loading')
    connect()
    window.setTimeout(() => setPhase('done'), 700)
  }

  return (
    <>
      <ScreenHeader
        step="예시 데이터"
        title="예시 데이터를 불러올게요"
        lead={DATA_NOTICE.connectScope}
        backHref="/app"
      />
      <div className="scroll-area flex flex-col gap-3">
        <Panel>
          <ul className="m-0 list-none space-y-3 p-0">
            {['보유 카드 목록과 연회비', '최근 12개월 소비 내역', '카드별 혜택 규칙과 적용 기준일'].map(
              (item) => (
                <li key={item} className="flex items-start gap-2 text-[14px] text-ink">
                  <span aria-hidden className="mt-0.5 text-primary">
                    ✓
                  </span>
                  {item}
                </li>
              ),
            )}
          </ul>
        </Panel>
        <Notice>
          실제 금융기관에 연결하지 않습니다. 동의를 받을 대상이 없어 약관·개인정보 동의 절차를 두지
          않았습니다.
        </Notice>
        {phase === 'done' ? (
          <Notice tone="positive">{DATA_NOTICE.connectDone}</Notice>
        ) : null}
      </div>
      <CtaBar>
        {phase === 'done' ? (
          <PrimaryButton onClick={() => router.push('/app/summary')}>
            현재 혜택 보기
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={start} disabled={phase === 'loading'}>
            {phase === 'loading' ? '불러오는 중…' : DATA_NOTICE.connectCta}
          </PrimaryButton>
        )}
      </CtaBar>
    </>
  )
}
