'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ONBOARDING_COPY } from '@/content/cardfit-copy'
import { MydataConsentSheet } from '@/features/cardfit/onboarding/mydata-consent-sheet'
import { Actions, PrimaryButton, Screen } from '@/components/shell'
import { useDemo } from '@/state/store'

/**
 * UI-011 온보딩 — 기준본 s0.
 *
 * `내 카드 조합 찾기`를 누르면 별도 화면으로 넘어가지 않고 마이데이터 동의 바텀시트가
 * 이 화면 위에 올라온다 (`P04-R1` · `P04-R2`). 동의를 마치면 현재 카드 확인으로 간다.
 */
export default function OnboardingScreen() {
  const router = useRouter()
  const { connect } = useDemo()
  const [consentOpen, setConsentOpen] = useState(false)

  useEffect(() => {
    router.prefetch('/app/summary')
  }, [router])

  const accept = () => {
    // 예시 데이터는 레이아웃에서 이미 로드됐다. 여기서는 동의 상태만 즉시 반영한다.
    connect()
    setConsentOpen(false)
    router.push('/app/summary')
  }

  return (
    <Screen>
      <div className="onboarding-kicker">{ONBOARDING_COPY.kicker}</div>
      <h2>
        {ONBOARDING_COPY.title[0]}
        <br />
        {ONBOARDING_COPY.title[1]}
      </h2>
      {/* 부연 문단과 하단 안내는 두지 않는다. 아이콘은 계약에 있다 (v0.5) */}
      <div className="onboarding-steps" aria-label="CardFit 이용 과정">
        {ONBOARDING_COPY.steps.map((step) => (
          <div key={step.title} className="onboarding-step">
            <span className="step-icon" aria-hidden>
              {step.icon}
            </span>
            <div>
              <b>{step.title}</b>
              <small>{step.body}</small>
            </div>
          </div>
        ))}
      </div>

      <Actions>
        <PrimaryButton onClick={() => setConsentOpen(true)}>{ONBOARDING_COPY.cta}</PrimaryButton>
      </Actions>

      <MydataConsentSheet
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        onAccept={accept}
      />
    </Screen>
  )
}
