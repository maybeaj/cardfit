'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { DATA_NOTICE, ONBOARDING_COPY } from '@/content/copy'
import { ConsentSheet } from '@/components/consent-sheet'
import { CtaBar, PrimaryButton } from '@/components/shell'
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
    <>
      <div className="scroll-area pt-10">
        <Image
          src="/cardfit-brand.png"
          alt=""
          width={402}
          height={402}
          priority
          className="mx-auto mb-6 h-auto w-[150px]"
        />
        <p className="m-0 mb-2 text-[10px] font-black tracking-[0.08em] text-primary">
          {ONBOARDING_COPY.kicker}
        </p>
        <h1 className="m-0 text-[21px] leading-[1.28] font-extrabold tracking-[-0.035em] text-ink">
          {ONBOARDING_COPY.title[0]}
          <br />
          {ONBOARDING_COPY.title[1]}
        </h1>
        <p className="mt-1.5 mb-0 text-[12px] leading-[1.55] text-subtle">
          {ONBOARDING_COPY.lead}
        </p>

        <div className="mt-[22px] grid gap-2" aria-label="CardFit 이용 과정">
          {ONBOARDING_COPY.steps.map((step) => (
            <div
              key={step.title}
              className="grid grid-cols-[34px_minmax(0,1fr)] items-center gap-2.5 rounded-[13px] border border-line bg-bg/60 px-[11px] py-2.5"
            >
              <span
                aria-hidden
                className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-primary-soft text-[16px]"
              >
                {step.icon}
              </span>
              <div>
                <b className="block text-[11px] text-ink">{step.title}</b>
                <small className="mt-px block text-[9px] leading-[1.4] text-subtle">
                  {step.body}
                </small>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl bg-primary-soft px-3 py-2.5 text-[11px] leading-[1.55] text-primary">
          <b>{ONBOARDING_COPY.noteTitle}</b>
          <br />
          {ONBOARDING_COPY.noteBody}
        </div>
        <p className="mt-3 mb-0 text-center text-[11px] font-semibold text-subtle">
          {DATA_NOTICE.mockOnly}
        </p>
      </div>

      <CtaBar>
        <PrimaryButton onClick={() => setConsentOpen(true)}>{ONBOARDING_COPY.cta}</PrimaryButton>
      </CtaBar>

      <ConsentSheet
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        onAccept={accept}
      />
    </>
  )
}
