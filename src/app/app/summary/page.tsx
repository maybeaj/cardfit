'use client'

import { CURRENT_STATE_NOTICE, DATA_NOTICE } from '@/content/copy'
import { diagnose } from '@/domain/diagnose'
import { CurrentSummary } from '@/features/cardfit/current/current-summary'
import { OwnedCardList } from '@/features/cardfit/current/owned-card-list'
import { Actions, Notice, PrimaryLink, Screen, ScreenHeader } from '@/components/shell'
import { useDemo } from '@/state/store'

/**
 * UI-001 현재 카드와 혜택 확인 — 기준본 s2.
 *
 * 지표 2개와 보유 카드 목록으로 끝낸다. 관찰된 사실만 노출하고 절감액·추천 카드·
 * 과거 기준 손실은 띄우지 않는다 (`T5` · `T11`).
 * `최근 12개월 소비 기준`과 미래지출 안내를 함께 노출한 경우에만 연 혜택을 허용한다
 * (`S03` · `AC-012`).
 */
export default function CurrentCardsScreen() {
  const { profile } = useDemo()
  const d = diagnose(profile)

  return (
    <Screen>
      <ScreenHeader
        title={
          <>
            지금 가지고 있는 카드부터
            <br />
            살펴볼게요.
          </>
        }
        lead={CURRENT_STATE_NOTICE.lead}
        backHref="/app"
      />

      <CurrentSummary annualSpend={d.annualSpend} annualBenefit={d.currentAnnualBenefit} />
      <OwnedCardList cards={d.perCard} />

      <Notice>{CURRENT_STATE_NOTICE.benefitNotice}</Notice>
      <p className="footer">
        {CURRENT_STATE_NOTICE.futureNotIncluded} · {DATA_NOTICE.sampleFootnote}
      </p>

      <Actions>
        <PrimaryLink href="/app/plan">{CURRENT_STATE_NOTICE.cta}</PrimaryLink>
      </Actions>
    </Screen>
  )
}
