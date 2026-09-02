import { chromium } from '@playwright/test'

const baseURL = process.env.CARDFIT_APP_URL ?? 'https://cardfit-woad.vercel.app'
const runs = Number(process.env.PERF_RUNS ?? 5)
const thresholdMs = Number(process.env.PERF_THRESHOLD_MS ?? 500)

const browser = await chromium.launch({ headless: true })
const samples = []

try {
  for (let run = 0; run < runs; run += 1) {
    const context = await browser.newContext({ viewport: { width: 402, height: 874 } })
    const page = await context.newPage()

    await page.goto(`${baseURL}/app`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: '카드조합 추천받기' }).click()
    await page.getByText('전체 동의').click()

    const startedAt = performance.now()
    await page.getByRole('button', { name: '마이데이터 이용 동의하기' }).click()
    await page.waitForURL('**/app/summary')
    await page.locator('main h2').waitFor({ state: 'visible' })
    samples.push(Math.round(performance.now() - startedAt))

    await context.close()
  }
} finally {
  await browser.close()
}

const sorted = [...samples].sort((a, b) => a - b)
const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1]
const result = { baseURL, runs, thresholdMs, samplesMs: samples, p95Ms: p95, pass: p95 <= thresholdMs }

console.log(JSON.stringify(result, null, 2))
process.exitCode = result.pass ? 0 : 1
