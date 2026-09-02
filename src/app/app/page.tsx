'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ONBOARDING_COPY } from '@/content/copy'
import { ConsentSheet } from '@/components/consent-sheet'
import { Actions, Note, PrimaryButton, Screen } from '@/components/shell'
import { useDemo } from '@/state/store'

/**
 * UI-011 온보딩 — 기준본 s0.
 *
 * `카드조합 추천받기`를 누르면 별도 화면으로 넘어가지 않고 마이데이터 동의 바텀시트가
 * 이 화면 위에 올라온다 (`P04-R1` · `P04-R2`). 동의를 마치면 현재 카드 확인으로 간다.
 */
export default function OnboardingScreen() {
  const router = useRouter()
  const { connect } = useDemo()
  const [consentOpen, setConsentOpen] = useState(false)

  const accept = () => {
    // 프로토타입에서는 동의 후 예시 데이터를 로드한다. 실제 인증·전송요구는 하지 않는다
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
      <p className="onboarding-copy">{ONBOARDING_COPY.lead}</p>

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

      <Note>
        <b>{ONBOARDING_COPY.noteTitle}</b>
        <br />
        {ONBOARDING_COPY.noteBody}
      </Note>

      <Actions>
        <PrimaryButton onClick={() => setConsentOpen(true)}>{ONBOARDING_COPY.cta}</PrimaryButton>
      </Actions>

      <ConsentSheet open={consentOpen} onClose={() => setConsentOpen(false)} onAccept={accept} />
    </Screen>
  )
}
