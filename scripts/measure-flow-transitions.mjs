import { chromium } from '@playwright/test'

const baseURL = process.env.CARDFIT_APP_URL ?? 'https://cardfit-woad.vercel.app'
const runs = Number(process.env.PERF_RUNS ?? 3)
const thresholdMs = Number(process.env.PERF_THRESHOLD_MS ?? 500)

const browser = await chromium.launch({ headless: true })
const samples = {}

const measure = async (name, action, ready) => {
  const startedAt = performance.now()
  await action()
  await ready()
  const elapsed = Math.round(performance.now() - startedAt)
  ;(samples[name] ??= []).push(elapsed)
}

try {
  for (let run = 0; run < runs; run += 1) {
    const context = await browser.newContext({ viewport: { width: 402, height: 874 } })
    const page = await context.newPage()

    await page.goto(baseURL, { waitUntil: 'networkidle' })
    await measure(
      'landing-to-app',
      () => page.getByRole('button', { name: /내 미래지출 혜택 시뮬레이션 하기/ }).click(),
      () => page.getByRole('heading', { name: /앞으로 쓸 돈을 입력하고/ }).waitFor(),
    )
    await page.getByRole('button', { name: '카드조합 추천받기' }).click()
    await page.getByText('전체 동의').click()
    await measure(
      'consent-to-summary',
      () => page.getByRole('button', { name: '마이데이터 이용 동의하기' }).click(),
      () => page.getByRole('heading', { name: /지금 가지고 있는 카드부터/ }).waitFor(),
    )
    await measure(
      'summary-to-plan',
      () => page.getByRole('link', { name: '앞으로 쓸 돈 반영하기' }).click(),
      () => page.getByRole('heading', { name: /예상되는 지출액을 입력해주세요/ }).waitFor(),
    )
    await measure(
      'plan-to-constraint',
      () => page.getByRole('link', { name: '다음', exact: true }).click(),
      () => page.getByRole('heading', { name: /어느 정도까지 바꿔도 괜찮나요/ }).waitFor(),
    )
    await measure(
      'calculate-to-result',
      () => page.getByRole('button', { name: '이 계획대로 계산하기' }).click(),
      () => page.getByRole('heading', { name: '확인한 앞으로 12개월 계획 기준 결과' }).waitFor(),
    )
    await measure(
      'result-to-evidence',
      () => page.getByRole('link', { name: '계산 근거 보기' }).click(),
      () => page.getByRole('heading', { name: '이 결과가 나온 이유' }).waitFor(),
    )
    await measure(
      'evidence-to-confirm',
      () => page.getByRole('button', { name: '이 조합 확정하기' }).click(),
      () => page.getByRole('heading', { name: '확정한 조합과 다음 행동' }).waitFor(),
    )
    await measure(
      'confirm-to-result',
      () => page.getByRole('link', { name: '다시 검토하기' }).click(),
      () => page.getByRole('heading', { name: '확인한 앞으로 12개월 계획 기준 결과' }).waitFor(),
    )
    await context.close()
  }
} finally {
  await browser.close()
}

const transitions = Object.fromEntries(
  Object.entries(samples).map(([name, values]) => [name, { samplesMs: values, maxMs: Math.max(...values) }]),
)
const pass = Object.values(transitions).every(({ maxMs }) => maxMs <= thresholdMs)

console.log(JSON.stringify({ baseURL, runs, thresholdMs, transitions, pass }, null, 2))
process.exitCode = pass ? 0 : 1
