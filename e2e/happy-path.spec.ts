import { expect, test } from '@playwright/test'

/**
 * QA-02 — Happy Path. 402×874와 1440×900 두 폭에서 완주한다 (NFR-003).
 * 화면 순서와 버튼은 `docs/prototype/cardfit-prd-srs-v0.4.html`의 s0~s7을 따른다 (`D-011`).
 */
test('랜딩에서 앱으로 들어가 조합을 확정한다', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /내 미래지출 혜택 시뮬레이션 하기/ }).click()

  // s0 온보딩 — 동의 체크박스는 시트 안에 있고 이 화면에는 없다
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByText('카드 선택이 어려운 순간')).toBeVisible()
  await expect(page.locator('input[type=checkbox]')).toHaveCount(0)
  await page.getByRole('button', { name: '카드조합 추천받기' }).click()

  // s1 마이데이터 이용 동의 — 필수 3항목을 모두 선택해야 열린다
  const sheet = page.getByRole('dialog')
  const submit = sheet.getByRole('button', { name: '마이데이터 이용 동의하기' })
  await expect(submit).toBeDisabled()
  await sheet.getByRole('checkbox').first().check()
  await submit.click()

  // s2 현재 카드와 혜택 확인 — 두 라벨 동시 노출, 최종 조합 0건 (AC-012)
  await expect(page).toHaveURL(/\/app\/summary$/)
  await expect(page.getByText('최근 12개월 지출액')).toBeVisible()
  await expect(page.getByText('앞으로의 지출은 아직 반영되지 않았어요')).toBeVisible()
  await expect(page.getByText('정리', { exact: true })).toHaveCount(0)
  await page.getByRole('link', { name: '앞으로 쓸 돈 반영하기' }).click()

  // s3 미래 지출 확인 — 빈 폼이 아니다 (T3)
  await expect(page.getByText('최근 소비 패턴으로 미리 채웠습니다', { exact: false })).toBeVisible()
  await expect(page.locator('input[type=number]')).toHaveCount(3)
  await page.getByRole('link', { name: '다음', exact: true }).click()

  // s4 계산 조건
  await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()

  // s5 계산 결과 — 결론 배너 + 배분표
  await expect(page.getByText('지금 조합 그대로면')).toBeVisible({ timeout: 15_000 })
  // 배너의 캡션과 아래 `비교 기준선` 블록 두 곳에 나온다 — 둘 다 있어야 정상이다
  await expect(page.getByText('현재 조합 3장을 그대로 쓸 때와 비교', { exact: false })).toHaveCount(2)
  await expect(page.getByText('이렇게 나눠 쓰세요')).toBeVisible()
  await expect(page.getByText('사용 카드 2장 · 신규 1장 이내에서의 최선')).toBeVisible()

  // 금지어 0건
  const resultText = (await page.locator('body').innerText()) ?? ''
  for (const banned of ['총혜택', '최대혜택', '놓쳤어요', '손해보고 있어요']) {
    expect(resultText).not.toContain(banned)
  }

  await page.getByRole('link', { name: '계산 근거 보기' }).click()

  // s6 근거 검증 — 6항목
  for (const field of [
    '실적구간',
    '혜택한도',
    '연회비',
    '제외조건',
    '기준일',
    '계산에 포함되지 않은 항목',
  ]) {
    await expect(page.getByText(field, { exact: false }).first()).toBeVisible()
  }
  await page.getByRole('button', { name: '이 조합 확정하기' }).click()

  // s7 확정 + 경계 — 아웃링크 1개, 해지 실행 버튼 0개 (AC-003 · AC-008)
  await expect(page.getByText('CardFit의 실행 경계')).toBeVisible()
  await expect(page.getByText('신청·해지는 카드사에서 직접 진행하셔야 합니다')).toBeVisible()
  await expect(page.locator('a[target=_blank]')).toHaveCount(1)
  await expect(page.getByText('아웃링크 1개 · 해지 실행 버튼 0개')).toBeVisible()
})

test('입력을 모두 지우면 다음 단계로 갈 수 없다 (AC-001)', async ({ page }) => {
  await page.goto('/app/plan')
  const deleteButtons = page.getByRole('button', { name: /항목 삭제$/ })
  const count = await deleteButtons.count()
  for (let i = 0; i < count; i += 1) await deleteButtons.first().click()

  await expect(page.getByText('앞으로 쓸 돈을 입력하면 카드 조합을 확인할 수 있어요.')).toBeVisible()
  await expect(page.getByRole('button', { name: '다음' })).toBeDisabled()
  // 계획이 0건이면 건너뛰기로 우회할 수도 없어야 한다
  await expect(page.getByRole('link', { name: '이 단계 건너뛰기' })).toHaveCount(0)

  await page.getByRole('button', { name: '과거 패턴으로 다시 채우기' }).click()
  await expect(page.locator('input[type=number]')).toHaveCount(3)
})

test('탭 네비게이션을 그리지 않는다 (T14)', async ({ page }) => {
  for (const path of ['/app', '/app/summary', '/app/plan']) {
    await page.goto(path)
    await expect(page.locator('nav')).toHaveCount(0)
  }
})

test('기준본 s3의 항목 추가와 건너뛰기가 동작한다', async ({ page }) => {
  await page.goto('/app/plan')

  // ＋ 지출 항목 추가 → 카테고리 피커 → 이 항목 추가
  await expect(page.locator('input[type=number]')).toHaveCount(3)
  await page.getByRole('button', { name: /지출 항목 추가/ }).click()
  await expect(page.getByText('추가할 지출 카테고리')).toBeVisible()
  await page.getByRole('button', { name: '이 항목 추가' }).click()
  await expect(page.locator('input[type=number]')).toHaveCount(4)

  // 이 단계 건너뛰기 → 계산 조건으로 간다
  await page.getByRole('link', { name: '이 단계 건너뛰기' }).click()
  await expect(page).toHaveURL(/\/app\/constraint$/)
})

test('랜딩 CTA는 앱을 처음부터 시작한다', async ({ page }) => {
  // 흐름을 진행해 세션에 입력을 남긴다
  await page.goto('/app/plan')
  const deleteButtons = page.getByRole('button', { name: /항목 삭제$/ })
  await deleteButtons.first().click()
  await expect(page.locator('input[type=number]')).toHaveCount(2)

  // 랜딩 CTA로 다시 들어오면 제안값이 복원된다 (`restart=1`)
  await page.goto('/')
  await page.getByRole('button', { name: /내 미래지출 혜택 시뮬레이션 하기/ }).click()
  await expect(page).toHaveURL(/\/app$/)
  await page.goto('/app/plan')
  await expect(page.locator('input[type=number]')).toHaveCount(3)
})
