import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const appUrl = process.env.CARDFIT_APP_URL ?? 'http://127.0.0.1:3100'
const referenceUrl =
  process.env.CARDFIT_REFERENCE_URL ??
  'http://127.0.0.1:3200/cardfit-prd-srs-v0.4.html'
const root = path.resolve('.omx/artifacts/visual-ralph/cardfit-v04')

await Promise.all([
  mkdir(path.join(root, 'reference'), { recursive: true }),
  mkdir(path.join(root, 'current'), { recursive: true }),
])

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 402, height: 874 } })

const reference = await context.newPage()
await reference.goto(referenceUrl)
await reference.locator('#s0 .panel').screenshot({ path: path.join(root, 'reference/onboarding-panel.png') })
await reference.getByRole('button', { name: '결과', exact: true }).click()
await reference.locator('#s5 .panel').screenshot({ path: path.join(root, 'reference/result-panel.png') })
await reference.getByRole('button', { name: '근거', exact: true }).click()
await reference.locator('#s6 .panel').screenshot({ path: path.join(root, 'reference/evidence-panel.png') })

const current = await context.newPage()
await current.goto(`${appUrl}/app`)
await current.screenshot({ path: path.join(root, 'current/onboarding-mobile.png'), fullPage: true })
await current.getByRole('button', { name: '카드조합 추천받기' }).click()
await current.getByRole('checkbox').first().check()
await current.getByRole('button', { name: '마이데이터 이용 동의하기' }).click()
await current.getByRole('link', { name: '앞으로 쓸 돈 반영하기' }).click()
await current.getByRole('link', { name: '다음' }).click()
await current.getByRole('button', { name: '이 계획대로 계산하기' }).click()
await current.waitForURL(/\/app\/result$/)
await current.screenshot({ path: path.join(root, 'current/result-mobile.png'), fullPage: true })
await current.getByRole('link', { name: '계산 근거 보기' }).click()
await current.waitForURL(/\/app\/evidence$/)
await current.screenshot({ path: path.join(root, 'current/evidence-mobile.png'), fullPage: true })

await browser.close()
