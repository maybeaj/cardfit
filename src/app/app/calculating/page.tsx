'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CALC_NOTICE } from '@/content/copy'
import { Notice, Panel, ScreenHeader } from '@/components/shell'
import { Progress } from '@/components/ui/progress'
import { useDemo } from '@/state/store'

/**
 * UI-004 Loading — 계산은 Server Action이 수행한다 (TEC-05).
 * 금액 산출과 설명 모두 결정론적 규칙·고정 템플릿이며 AI를 쓰지 않는다 (C-TEC-005·006 기각).
 */
export default function CalculatingScreen() {
  const router = useRouter()
  const { requestCalculation, calculation, error, plan } = useDemo()
  const [step, setStep] = useState(0)
  const requested = useRef(false)

  useEffect(() => {
    if (requested.current) return
    requested.current = true
    if (plan.length === 0) {
      router.replace('/app/plan')
      return
    }
    requestCalculation()
  }, [plan.length, requestCalculation, router])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStep((prev) => Math.min(prev + 1, CALC_NOTICE.steps.length))
    }, 320)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    // 결과든 오류든 결과 화면이 상태를 표시한다 — 오류를 성공처럼 넘기지 않는다
    if ((calculation || error) && step >= CALC_NOTICE.steps.length) router.push('/app/result')
  }, [calculation, error, step, router])

  return (
    <>
      <ScreenHeader step="계산 중" title="확인한 계획으로 조합을 계산하고 있어요" />
      <div className="scroll-area flex flex-col gap-3">
        <Progress
          value={(step / CALC_NOTICE.steps.length) * 100}
          aria-label="계산 진행률"
          className="h-1.5"
        />
        <Panel>
          <ol className="m-0 list-none space-y-3 p-0">
            {CALC_NOTICE.steps.map((label, index) => (
              <li key={label} className="flex items-center gap-2 text-[14px]">
                <span
                  aria-hidden
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    index < step ? 'bg-primary text-white' : 'bg-bg text-subtle'
                  }`}
                >
                  {index < step ? '✓' : index + 1}
                </span>
                <span className={index < step ? 'text-ink' : 'text-subtle'}>{label}</span>
              </li>
            ))}
          </ol>
        </Panel>
        <Notice>{CALC_NOTICE.engine}</Notice>
      </div>
    </>
  )
}
