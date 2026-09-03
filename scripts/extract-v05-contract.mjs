/**
 * v0.5 기준본의 **최종 렌더 상태**를 UI 계약으로 뽑아낸다.
 *
 * 기준본 HTML은 정적 DOM이 곧 화면이 아니다 — 파일 끝의 `UX review` 스크립트가
 * DOM을 다시 쓴다. 제목·버튼 문구를 바꾸고, 어떤 노드는 지우고(`#s0 .note`는 넣었다가
 * 도로 지운다), 카테고리 피커를 바텀시트로 갈아 끼운다. 정적 HTML을 읽어 옮기면
 * 중간 상태를 이식하게 된다.
 *
 * 게다가 결과 화면은 흐름을 걸어야 채워진다 — `calculate()`가 돌기 전에는 `#resultBox`가
 * 비어 있고 `이 조합 선택하기` 문구도 나오지 않는다. 그래서 정적으로 훑지 않고
 * 프로토타입을 실제로 조작해 상태마다 DOM과 스크린샷을 남긴다.
 *
 * 산출물은 `docs/ux/v05-contract/`:
 *   screens.txt   상태별 최종 텍스트 — 카피를 옮길 때 읽는다
 *   screens.json  상태별 innerHTML·버튼 목록
 *   *.png         402×874 스크린샷 — 시각 회귀의 기준선
 */
import { chromium } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const SRC = resolve(root, 'docs/prototype/cardfit-prd-srs-v0.5.html')
const OUT = process.env.OUT ?? resolve(root, 'docs/ux/v05-contract')

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 402, height: 874 } })
await page.goto(`file://${SRC}`)
await page.waitForLoadState('networkidle')

const captured = {}

/** 현재 화면의 최종 상태를 남긴다. 프로토타입은 `.screen.active` 하나만 보인다. */
async function capture(name, note) {
  const state = await page.evaluate(() => {
    const active = document.querySelector('.screen.active')
    const candidates = [
      document.getElementById('consentModal'),
      document.getElementById('resultEvidenceModal'),
      document.querySelector('.category-sheet-backdrop'),
    ].filter(Boolean)
    const modal = candidates.find(
      (m) => !m.classList.contains('hidden') && getComputedStyle(m).display !== 'none',
    )
    const target = modal ?? active
    return {
      screenId: active?.id ?? null,
      overlay: modal ? (modal.id || modal.className) : null,
      text: (target?.innerText ?? '').replace(/\n{3,}/g, '\n\n').trim(),
      html: target?.innerHTML ?? '',
      buttons: [...(target?.querySelectorAll('button, a.primary, a.ghost') ?? [])]
        .map((el) => el.textContent?.trim())
        .filter((t) => t && t.length < 40),
    }
  })
  captured[name] = { note, ...state }
  await page.locator('.device-screen').screenshot({ path: `${OUT}/${name}.png` })
  console.log(`  ${name}  screen=${state.screenId} overlay=${state.overlay ?? '-'}`)
}

// 01 온보딩 — UX review가 카피를 전부 갈아 끼운 뒤의 상태
await capture('01-onboarding', '온보딩. 3단계 안내와 `내 카드 조합 찾기`')

// 02 마이데이터 동의 바텀시트
await page.evaluate(() => window.openConsent())
await page.waitForTimeout(150)
await capture('02-consent-sheet', '온보딩 위로 올라오는 동의 바텀시트')

// 03 동의 상세 펼침
const detailCount = await page.evaluate(() => {
  const items = [...document.querySelectorAll('#consentModal details')]
  items.forEach((d) => d.setAttribute('open', ''))
  return items.length
})
await page.waitForTimeout(100)
await capture('03-consent-detail', `동의 항목 상세 펼침 (details ${detailCount}개)`)

// 04 현재 카드
await page.evaluate(() => {
  document.querySelectorAll('.required-consent').forEach((c) => (c.checked = true))
  window.updateConsentState?.()
  window.acceptConsent()
})
await page.waitForTimeout(150)
await capture('04-summary', '현재 카드와 최근 12개월')

// 05 미래지출 입력
await page.evaluate(() => window.go('s3'))
await page.waitForTimeout(150)
await capture('05-plan', '미래지출 입력. 만원 입력·원 되읽기·지출 기간')

// 06 카테고리 바텀시트
await page.evaluate(() => {
  const select = document.querySelector('#spends .spend-category')
  const trigger = select?.parentElement?.querySelector('.category-trigger')
  trigger?.click()
})
await page.waitForTimeout(200)
await capture('06-category-sheet', '카테고리 선택 바텀시트 — 7묶음')

// 07 변경 조건
await page.evaluate(() => {
  document.querySelector('.category-sheet-close')?.click()
  window.go('s4')
})
await page.waitForTimeout(150)
await capture('07-constraint', '계산 조건. 최대 카드 수·신규 포함 여부')

// 08 결과
await page.evaluate(() => {
  window.calculate()
  window.go('s5')
})
await page.waitForTimeout(250)
await capture('08-result', '결과. 시나리오 탭·혜택·배분·카드별 역할')

// 09 계산 기준 요약 바텀시트 — 상세 근거 화면과 다른 화면이다
await page.evaluate(() => window.openResultEvidence())
await page.waitForTimeout(200)
await capture('09-basis-sheet', '계산 기준 요약 바텀시트 (전체 근거와 별개)')

// 10 좋아요 이후 — 같은 화면에서 `다음에 하면 되는 일`이 펼쳐진다
await page.evaluate(() => {
  window.closeResultEvidence?.()
  const like = document.getElementById('likeCombination')
  window.likeCombination(like)
})
await page.waitForTimeout(200)
await capture('10-result-liked', '좋아요 이후 같은 화면에서 다음 행동 펼침')

// 11 전체 근거
await page.evaluate(() => window.go('s6'))
await page.waitForTimeout(200)
await capture('11-evidence', '전체 근거 상세 화면')

writeFileSync(`${OUT}/screens.json`, JSON.stringify(captured, null, 2))
writeFileSync(
  `${OUT}/screens.txt`,
  Object.entries(captured)
    .map(
      ([name, s]) =>
        `${'='.repeat(64)}\n${name} — ${s.note}\n` +
        `screen=${s.screenId}  overlay=${s.overlay ?? '-'}\n` +
        `buttons: ${s.buttons.join(' | ')}\n${'='.repeat(64)}\n${s.text}`,
    )
    .join('\n\n'),
)

console.log(`\n계약 ${Object.keys(captured).length}개 상태를 ${OUT}에 남겼다`)
await browser.close()
