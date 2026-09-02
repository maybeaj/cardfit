import Link from 'next/link'
import { BOUNDARY_COPY, CALC_NOTICE, CONCLUSION_COPY, DATA_NOTICE } from '@/content/copy'
import { NET_BENEFIT_FLOOR, NET_BENEFIT_RATIO } from '@/domain/calc'
import { won } from '@/domain/format'

const FLOW = [
  '예시 데이터 연결',
  '현재 혜택 요약',
  '현재 카드 진단',
  '앞으로 쓸 돈 입력',
  '변경 조건',
  '조합 계산 · 바꿀 가치 판단',
  '배분 · 근거 확인',
  '조합 확정 · 카드사로 이동',
]

const VALUES = [
  {
    title: '더 큰 절약',
    body: '앞으로 12개월 지출까지 계산해 더 유리한 카드 조합을 찾습니다.',
    tag: '미래지출 + 조합 계산',
  },
  {
    title: '확신 있는 선택',
    body: '적용된 실적구간·한도·연회비·제외조건을 그대로 펼쳐 봅니다.',
    tag: '근거 6항목 공개',
  },
  {
    title: '쉬운 결정',
    body: '복잡한 조건은 규칙 엔진이 계산하고, 사용자는 결정에 집중합니다.',
    tag: '결론 우선 UI',
  },
]

const DIFFERENCE = [
  { label: '기존 추천', body: '지난 1년 소비 → 카드 한 장 비교 → 발급 페이지 연결' },
  {
    label: 'CardFit',
    body: '현재 소비 확인 → 앞으로 쓸 돈 입력 → 카드 조합 재계산 → 근거 확인 → 카드사 연결',
  },
]

const SCREENS = [
  { no: '①', title: '앞으로 쓸 돈', body: '이벤트 이름 없이 카테고리·금액·시점만 받습니다.', tag: '화면 2 · FR-001' },
  { no: '②', title: '얼마나 더 유리한가', body: '신규·유지·정리를 한 조합으로 제시합니다.', tag: '화면 4 · FR-003' },
  { no: '③', title: '왜 이런 결과인가', body: '적용 규칙과 계산에 넣지 않은 항목을 공개합니다.', tag: '화면 5 · FR-005' },
  { no: '④', title: '어디까지 해주는가', body: '신청 대행 없이 공식 페이지로 이동만 제공합니다.', tag: '화면 6 · FR-008' },
]

export default function LandingPage() {
  return (
    <main className="mx-auto w-full max-w-[1080px] px-6 pb-24">
      <nav className="flex items-center justify-between py-6">
        <span className="text-[17px] font-extrabold tracking-tight text-ink">
          Card<span className="text-primary">Fit</span>
        </span>
        <Link
          href="/app"
          className="rounded-[var(--radius-button)] bg-primary px-4 py-2.5 text-[14px] font-bold text-white"
        >
          앱 데모 열기
        </Link>
      </nav>

      <section className="pt-10 pb-14">
        <p className="m-0 text-[13px] font-bold tracking-wide text-primary">
          미래지출 결제설계 서비스 · 프로토타입
        </p>
        <h1 className="mt-4 mb-0 text-[38px] leading-[1.22] font-extrabold tracking-tight text-ink md:text-[52px]">
          과거 분석을 넘어,
          <br />
          앞으로 쓸 돈으로 카드 조합을 다시 계산합니다
        </h1>
        <p className="mt-5 mb-0 max-w-[640px] text-[16px] leading-relaxed text-subtle">
          결혼·이사처럼 예정된 고액 지출을 앞둔 다장 카드 사용자가, 현재 카드를 유지할지 더 유리한
          조합으로 바꿀지와 결제 배분을 근거와 함께 5분 안에 결정하도록 돕습니다.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/app"
            className="rounded-[var(--radius-button)] bg-primary px-6 py-3.5 text-[16px] font-bold text-white"
          >
            앱 데모 시연하기
          </Link>
          <span className="rounded-[var(--radius-button)] border border-line bg-surface px-4 py-3 text-[13px] font-semibold text-subtle">
            {DATA_NOTICE.mockOnly} · 실제 마이데이터를 연동하지 않습니다
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {DIFFERENCE.map((item) => (
          <article
            key={item.label}
            className={`rounded-[var(--radius-card)] p-6 ${
              item.label === 'CardFit'
                ? 'bg-ink text-white'
                : 'border border-line bg-surface text-ink'
            }`}
          >
            <p
              className={`m-0 text-[12px] font-bold tracking-wide ${
                item.label === 'CardFit' ? 'text-white/70' : 'text-subtle'
              }`}
            >
              {item.label}
            </p>
            <p className="mt-3 mb-0 text-[16px] leading-relaxed font-semibold">{item.body}</p>
          </article>
        ))}
      </section>
      <p className="mt-4 mb-0 text-[13px] text-subtle">
        차이는 발급 연결이 아니라, 그 전에 &lsquo;미래 입력&rsquo;과 &lsquo;조합 계산&rsquo;을 거친다는
        점입니다.
      </p>

      <section className="pt-16">
        <h2 className="m-0 text-[24px] font-extrabold tracking-tight text-ink">
          고객에게 남는 것은 더 큰 절약 · 확신 · 쉬운 결정입니다
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {VALUES.map((value) => (
            <article
              key={value.title}
              className="rounded-[var(--radius-card)] border border-line bg-surface p-5"
            >
              <h3 className="m-0 text-[17px] font-extrabold text-ink">{value.title}</h3>
              <p className="mt-2 mb-3 text-[14px] leading-relaxed text-subtle">{value.body}</p>
              <span className="inline-flex rounded-lg bg-primary-soft px-2 py-1 text-[11.5px] font-bold text-primary">
                {value.tag}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="pt-16">
        <h2 className="m-0 text-[24px] font-extrabold tracking-tight text-ink">
          입력부터 확정까지 한 흐름으로 끝냅니다
        </h2>
        <ol className="mt-6 grid list-none gap-2 p-0 md:grid-cols-4">
          {FLOW.map((step, index) => (
            <li
              key={step}
              className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3"
            >
              <span className="block text-[11.5px] font-bold text-primary">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="mt-1 block text-[14px] font-semibold text-ink">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 mb-0 text-[13px] text-subtle">
          바꿀 가치가 없으면 <strong className="text-ink">&ldquo;현재 조합 유지&rdquo;</strong>도 정상
          결과입니다. 실패 화면이 아닙니다.
        </p>
      </section>

      <section className="pt-16">
        <h2 className="m-0 text-[24px] font-extrabold tracking-tight text-ink">
          얼마나 이득인지, 왜 그런지, 어디까지 해주는지 한 화면씩 보여줍니다
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {SCREENS.map((screen) => (
            <article
              key={screen.no}
              className="rounded-[var(--radius-card)] border border-line bg-surface p-5"
            >
              <span className="text-[20px] font-extrabold text-primary">{screen.no}</span>
              <h3 className="mt-2 mb-2 text-[16px] font-extrabold text-ink">{screen.title}</h3>
              <p className="m-0 text-[13.5px] leading-relaxed text-subtle">{screen.body}</p>
              <p className="mt-3 mb-0 text-[11.5px] font-semibold text-subtle">{screen.tag}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pt-16">
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
          <h2 className="m-0 text-[20px] font-extrabold tracking-tight text-ink">
            {CALC_NOTICE.engine}
          </h2>
          <ul className="mt-4 mb-0 grid list-none gap-2 p-0 md:grid-cols-2">
            {CALC_NOTICE.steps.map((step) => (
              <li key={step} className="rounded-xl bg-bg px-3 py-2 text-[13.5px] text-ink">
                {step}
              </li>
            ))}
          </ul>
          <dl className="mt-5 mb-0 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-bg px-4 py-3">
              <dt className="m-0 text-[12px] font-bold text-subtle">변경을 권하는 조건</dt>
              <dd className="m-0 mt-1 text-[14px] font-semibold text-ink">
                순혜택 ≥ {won(NET_BENEFIT_FLOOR)} <span className="text-primary">AND</span> 추가 혜택의{' '}
                {Math.round(NET_BENEFIT_RATIO * 100)}% 이상
              </dd>
            </div>
            <div className="rounded-xl bg-bg px-4 py-3">
              <dt className="m-0 text-[12px] font-bold text-subtle">결론 표기</dt>
              <dd className="m-0 mt-1 text-[14px] font-semibold text-ink">
                {CONCLUSION_COPY.boundedOptimum}
              </dd>
            </div>
          </dl>
          <p className="mt-4 mb-0 text-[12.5px] leading-relaxed text-subtle">
            임계값은 실측이 아니라 과잉 추천을 막기 위한 팀 합의 상수입니다. 시장의 보편 기준으로
            인용하지 않습니다.
          </p>
        </div>
      </section>

      <section className="pt-16">
        <div className="rounded-[var(--radius-card)] bg-ink p-6 text-white">
          <h2 className="m-0 text-[20px] font-extrabold tracking-tight">
            {BOUNDARY_COPY.headline}
          </h2>
          <p className="mt-3 mb-0 text-[15px] leading-relaxed text-white/75">
            {BOUNDARY_COPY.direct} — {BOUNDARY_COPY.outlinkNote}
          </p>
          <p className="mt-4 mb-0 text-[12.5px] leading-relaxed text-white/70">
            {DATA_NOTICE.sampleFootnote} · 실제 결제·인증·민감정보를 다루지 않습니다.
          </p>
        </div>
      </section>

      <section className="pt-12">
        <Link
          href="/app"
          className="block rounded-[var(--radius-button)] bg-primary px-6 py-4 text-center text-[17px] font-bold text-white"
        >
          앱 데모 시연하기
        </Link>
      </section>
    </main>
  )
}
