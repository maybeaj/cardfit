/**
 * 계약 DOM과 우리 화면을 상태별로 대조한다.
 *
 * 스크린샷을 눈으로 보고 판단하면 놓친다 — 실제로 온보딩의 `.step-icon`을 "없다"고
 * 읽고 지웠는데 계약에는 있었다. 클래스 구조와 텍스트를 기계로 비교한다.
 *
 * 금액과 카드 이름은 다르다(프로토타입은 신한 Mr.Life, 앱은 마이데이터 CSV). 그래서
 * **구조(클래스)**를 주로 보고 텍스트는 참고로만 찍는다.
 *
 * 실행: `npm run ux:diff` (앱이 3100에 떠 있어야 한다)
 */
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const BASE = process.env.BASE ?? 'http://127.0.0.1:3100'
const contract = JSON.parse(
  readFileSync(resolve(root, 'docs/ux/v05-contract/screens.json'), 'utf-8'),
)

/** 태그와 클래스만 남긴 구조 서명. 텍스트·속성은 버린다 */
function signature(html) {
  const out = []
  const re = /<([a-z0-9]+)([^>]*)>/gi
  let m
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase()
    if (tag === 'br' || tag === 'path' || tag === 'svg') continue
    const cls = /class="([^"]*)"/.exec(m[2])?.[1] ?? ''
    out.push(cls ? `${tag}.${cls.trim().split(/\s+/).join('.')}` : tag)
  }
  return out
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 402, height: 874 } })

/** 우리 앱에서 같은 상태를 만든다 */
const states = {
  '01-onboarding': async () => {
    await page.goto(`${BASE}/app`)
    await page.getByRole('button', { name: '내 카드 조합 찾기' }).waitFor()
    return '.screen .panel'
  },
  '02-consent-sheet': async () => {
    await page.goto(`${BASE}/app`)
    await page.getByRole('button', { name: '내 카드 조합 찾기' }).click()
    await page.getByRole('dialog').waitFor()
    return '[role=dialog]'
  },
  '04-summary': async () => {
    await page.goto(`${BASE}/app/summary`)
    await page.locator('.panel').first().waitFor()
    // 계약은 접힌 상세를 `hidden`으로 DOM에 두고 우리는 조건부로 그린다. 펴서 비교한다
    await page.locator('.card-toggle').first().click()
    await page.locator('.card-detail').first().waitFor()
    return '.screen .panel'
  },
  '05-plan': async () => {
    await page.goto(`${BASE}/app/plan`)
    await page.locator('.spend').first().waitFor()
    return '.screen .panel'
  },
  '06-category-sheet': async () => {
    await page.goto(`${BASE}/app/plan`)
    await page.getByRole('button', { name: /지출 추가/ }).click()
    await page.getByRole('dialog').waitFor()
    return '[role=dialog]'
  },
  '07-constraint': async () => {
    await page.goto(`${BASE}/app/constraint`)
    await page.locator('.panel').first().waitFor()
    return '.screen .panel'
  },
  '08-result': async () => {
    await page.goto(`${BASE}/app/constraint`)
    await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()
    await page.waitForURL('**/app/result')
    await page.locator('.allocation, .result').first().waitFor()
    return '.screen .panel'
  },
  '09-basis-sheet': async () => {
    await page.goto(`${BASE}/app/constraint`)
    await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()
    await page.waitForURL('**/app/result')
    await page.getByRole('button', { name: /계산 기준 보기/ }).click()
    await page.getByRole('dialog').waitFor()
    return '[role=dialog]'
  },
  '10-result-liked': async () => {
    await page.goto(`${BASE}/app/constraint`)
    await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()
    await page.waitForURL('**/app/result')
    await page.getByRole('button', { name: '이 조합 선택하기' }).click()
    await page.locator('.next-actions').waitFor()
    return '.screen .panel'
  },
  '11-evidence': async () => {
    await page.goto(`${BASE}/app/constraint`)
    await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()
    await page.waitForURL('**/app/result')
    await page.getByRole('button', { name: /계산 기준 보기/ }).click()
    await page.getByRole('link', { name: '전체 근거 보기' }).click()
    await page.waitForURL('**/app/evidence')
    await page.locator('.panel').first().waitFor()
    return '.screen .panel'
  },
}

let missingTotal = 0
for (const [name, drive] of Object.entries(states)) {
  const ref = contract[name]
  if (!ref) continue
  let selector
  try {
    selector = await drive()
  } catch (error) {
    console.log(`\n### ${name}\n  !! 상태를 만들지 못함: ${String(error).split('\n')[0]}`)
    continue
  }
  const target = page.locator(selector).first()
  const ours =
    selector === '[role=dialog]' ? await target.evaluate((n) => n.outerHTML) : await target.innerHTML()

  /*
   * 계약은 `<section>`의 innerHTML이라 `.panel`을 포함하고 우리는 `.panel` 안쪽만 본다.
   * 기준을 맞추지 않으면 `panel`이 늘 "없는 것"으로 나와 진짜 차이를 덮는다.
   * `badge`는 기준본이 CSS로 감추므로(`.device .panel>.badge{display:none}`) 뺀다.
   */
  const IGNORED = new Set(['panel', 'badge', 'screen', 'hidden'])
  const refClasses = new Set(
    signature(ref.html)
      .flatMap((s) => s.split('.').slice(1))
      .filter((c) => !IGNORED.has(c)),
  )
  const ourClasses = new Set(
    signature(ours)
      .flatMap((s) => s.split('.').slice(1))
      .filter((c) => !IGNORED.has(c)),
  )

  const missing = [...refClasses].filter((c) => !ourClasses.has(c))
  const extra = [...ourClasses].filter((c) => !refClasses.has(c))

  /*
   * 제목도 본다. 클래스만 비교하면 구조는 맞는데 문구가 다른 상태를 놓친다 —
   * 실제로 `앞으로 쓸 돈을 입력해 주세요.`가 옛 문구로 남아 있었다.
   */
  const heads = (html) =>
    [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gs)].map((m) =>
      m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    )
  const refHeads = heads(ref.html)
  const ourHeads = heads(ours)

  console.log(`\n### ${name}`)
  if (refHeads.join('|') !== ourHeads.join('|')) {
    console.log(`  제목 다름 — 계약 ${JSON.stringify(refHeads)} / 우리 ${JSON.stringify(ourHeads)}`)
  }
  if (missing.length) {
    missingTotal += missing.length
    console.log(`  없는 것 (${missing.length}): ${missing.join(' ')}`)
  }
  if (extra.length) console.log(`  더 있는 것 (${extra.length}): ${extra.join(' ')}`)
  if (!missing.length && !extra.length) console.log('  구조 일치')
}

console.log(`\n계약에 있는데 우리에게 없는 클래스 총 ${missingTotal}개`)
await browser.close()
