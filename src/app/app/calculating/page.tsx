'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CALC_NOTICE } from '@/content/copy'
import { Note, Screen, ScreenHeader } from '@/components/shell'
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
    }, 50)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    // 결과든 오류든 결과 화면이 상태를 표시한다 — 오류를 성공처럼 넘기지 않는다
    if ((calculation || error) && step >= CALC_NOTICE.steps.length) router.push('/app/result')
  }, [calculation, error, step, router])

  return (
    <Screen>
      <ScreenHeader title="확인한 계획으로 조합을 계산하고 있어요" />

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
        <div
          className="h-full rounded-full bg-[var(--color-blue)] transition-[width] duration-300"
          style={{ width: `${(step / CALC_NOTICE.steps.length) * 100}%` }}
          role="progressbar"
          aria-label="계산 진행률"
          aria-valuenow={step}
          aria-valuemin={0}
          aria-valuemax={CALC_NOTICE.steps.length}
        />
      </div>

      <ol className="mt-4 mb-0 grid list-none gap-2 p-0">
        {CALC_NOTICE.steps.map((label, index) => (
          <li key={label} className="flex items-center gap-2 text-[11px]">
            <span
              aria-hidden
              className={`inline-flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold ${
                index < step
                  ? 'bg-[var(--color-blue)] text-white'
                  : 'bg-[var(--color-bg)] text-[var(--color-subtle)]'
              }`}
            >
              {index < step ? '✓' : index + 1}
            </span>
            <span className={index < step ? 'text-[var(--color-ink)]' : 'text-[var(--color-subtle)]'}>
              {label}
            </span>
          </li>
        ))}
      </ol>

      <Note>{CALC_NOTICE.engine}</Note>
    </Screen>
  )
}
