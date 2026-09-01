import Image from 'next/image'
import { DATA_NOTICE } from '@/content/copy'
import { CtaBar, PrimaryLink } from '@/components/ui'

/** UI-011 온보딩 — 브랜드 진입 + 예시 데이터 고지. 약관·개인정보 동의 체크박스를 만들지 않는다 (T8 · P04-R2). */
export default function OnboardingScreen() {
  return (
    <>
      <div className="scroll-area flex flex-col justify-center pt-16">
        <Image
          src="/cardfit-brand.png"
          alt=""
          width={402}
          height={402}
          priority
          className="mx-auto w-[200px] h-auto"
        />
        <h1 className="mt-8 mb-0 text-center text-[26px] leading-[1.3] font-extrabold tracking-tight text-ink">
          앞으로 쓸 돈으로
          <br />
          카드 조합을 다시 계산합니다
        </h1>
        <p className="mt-3 mb-0 text-center text-[14px] leading-relaxed text-muted">
          결혼·이사처럼 큰 지출이 예정돼 있다면
          <br />
          지금 조합이 앞으로도 맞는지 확인해 보세요.
        </p>
        <p className="mt-8 mb-0 rounded-xl bg-bg px-4 py-3 text-center text-[13px] font-semibold text-muted">
          {DATA_NOTICE.mockOnly}
        </p>
      </div>
      <CtaBar>
        <PrimaryLink href="/app/connect">시작하기</PrimaryLink>
      </CtaBar>
    </>
  )
}
