'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CALC_NOTICE } from '@/content/copy'
import { Notice, Panel, ScreenHeader } from '@/components/ui'
import { useDemo } from '@/state/store'

/** UI-004 Loading — 금액 산출은 규칙 엔진, AI는 근거 설명에 한정임을 화면에 명시한다. */
export default function CalculatingScreen() {
  const router = useRouter()
  const { planConfirmed } = useDemo()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!planConfirmed) {
      router.replace('/app/plan')
      return
    }
    const timer = window.setInterval(() => {
      setStep((prev) => {
        if (prev >= CALC_NOTICE.steps.length) {
          window.clearInterval(timer)
          router.push('/app/result')
          return prev
        }
        return prev + 1
      })
    }, 420)
    return () => window.clearInterval(timer)
  }, [planConfirmed, router])

  return (
    <>
      <ScreenHeader step="계산 중" title="확인한 계획으로 조합을 계산하고 있어요" />
      <div className="scroll-area flex flex-col gap-3">
        <Panel>
          <ol className="m-0 list-none space-y-3 p-0">
            {CALC_NOTICE.steps.map((label, index) => (
              <li key={label} className="flex items-center gap-2 text-[14px]">
                <span
                  aria-hidden
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    index < step ? 'bg-primary text-white' : 'bg-bg text-muted'
                  }`}
                >
                  {index < step ? '✓' : index + 1}
                </span>
                <span className={index < step ? 'text-ink' : 'text-muted'}>{label}</span>
              </li>
            ))}
          </ol>
        </Panel>
        <Notice>{CALC_NOTICE.engine}</Notice>
      </div>
    </>
  )
}
