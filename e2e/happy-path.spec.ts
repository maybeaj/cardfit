import { expect, test } from '@playwright/test'

/**
 * QA-02 — Happy Path. 402×874와 1440×900 두 폭에서 완주한다 (NFR-003).
 * 화면 순서와 버튼은 `docs/prototype/cardfit-prd-srs-v0.4.html`의 s0~s6을 따른다 (`D-011`).
 */
test('랜딩에서 앱으로 들어가 조합 결과와 근거까지 확인한다', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /내 미래지출 혜택 시뮬레이션 하기/ }).click()

  // s0 온보딩
  await expect(page).toHaveURL(/\/app/)
  await expect(page.getByText('카드 선택이 어려운 순간')).toBeVisible()
  await page.getByRole('button', { name: '카드조합 추천받기' }).click()

  // s1 마이데이터 이용 동의 — 필수 3항목을 모두 선택해야 열린다
  const sheet = page.getByRole('dialog')
  const submit = sheet.getByRole('button', { name: '마이데이터 이용 동의하기' })
  await expect(submit).toBeDisabled()
  await sheet.getByRole('checkbox').first().check()
  await submit.click()

  // s2 현재 카드와 혜택 확인 — 관찰된 사실만 나온다 (AC-012)
  await expect(page).toHaveURL(/\/app\/summary$/)
  await expect(page.getByText('최근 12개월 지출액')).toBeVisible()
  await expect(page.getByText('최근 12개월 받은 혜택')).toBeVisible()
  await page.getByRole('link', { name: '앞으로 쓸 돈 반영하기' }).click()

  // s3 미래 지출 확인 — 빈 폼이 아니다 (`T3`)
  await expect(page).toHaveURL(/\/app\/plan$/)
  await expect(page.locator('input[type=number]')).toHaveCount(3)
  await page.getByRole('button', { name: '다음', exact: true }).click()

  // s4 계산 조건
  await expect(page).toHaveURL(/\/app\/constraint$/)
  await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()

  // s5 결과 — 결론 + 카드별 역할
  await expect(page).toHaveURL(/\/app\/result$/)
  await expect(page.getByText('이 조합으로 받을 수 있는 연간 혜택')).toBeVisible()
  await expect(page.getByText('이렇게 사용해 보세요')).toBeVisible()
  await expect(page.locator('.result-card')).toHaveCount(3)

  // 금지어 0건 (QA-01-04 · `T26`)
  const resultText = (await page.locator('body').innerText()) ?? ''
  for (const banned of ['총혜택', '최대혜택', '놓쳤어요', '손해보고 있어요']) {
    expect(resultText).not.toContain(banned)
  }

  // 신규 발급 1장만 아웃링크, 해지 실행 버튼은 0개다 (AC-003 · `T25`)
  await expect(page.locator('.result-card a[target=_blank]')).toHaveCount(1)
  await expect(page.locator('.result-card.status-organize a')).toHaveCount(0)

  // s6 상세 근거 — 결론 화면에서만 진입한다
  await page.getByRole('button', { name: /왜 이 금액인가요/ }).click()
  await page.getByRole('button', { name: '전체 근거 보기' }).click()
  await expect(page).toHaveURL(/\/app\/evidence$/)
  for (const field of ['실적구간', '혜택한도', '연회비', '제외조건', '기준일', '미반영 항목']) {
    await expect(page.getByText(field, { exact: false }).first()).toBeVisible()
  }
})

test('탭 네비게이션을 그리지 않는다 (T14)', async ({ page }) => {
  for (const path of ['/app', '/app/summary', '/app/plan']) {
    await page.goto(path)
    await expect(page.locator('nav')).toHaveCount(0)
  }
})

test('기준본 s3의 항목 추가와 건너뛰기가 동작한다', async ({ page }) => {
  await page.goto('/app/plan')

  // 중간 선택창 없이 편집 가능한 새 항목이 바로 추가된다 (UI-002)
  await expect(page.locator('input[type=number]')).toHaveCount(3)
  await page.getByRole('button', { name: /지출 항목 추가/ }).click()
  await expect(page.locator('input[type=number]')).toHaveCount(4)

  // 이 단계 건너뛰기 → 제안값을 유지한 채 계산 조건으로 간다
  await page.getByRole('button', { name: '이 단계 건너뛰기' }).click()
  await expect(page).toHaveURL(/\/app\/constraint$/)
})

test('랜딩 CTA는 앱을 처음부터 시작한다', async ({ page }) => {
  // 흐름을 진행해 세션에 입력을 남긴다
  await page.goto('/app/plan')
  await page.getByRole('button', { name: /가전\/가구 항목 삭제/ }).click()
  await expect(page.locator('input[type=number]')).toHaveCount(2)

  // 랜딩 CTA로 다시 들어오면 제안값이 복원된다 (`restart=1`)
  await page.goto('/')
  await page.getByRole('button', { name: /내 미래지출 혜택 시뮬레이션 하기/ }).click()
  await expect(page).toHaveURL(/\/app/)
  await page.goto('/app/plan')
  await expect(page.locator('input[type=number]')).toHaveCount(3)
})

test('아웃링크에서 돌아오면 입력값이 남아 있다 (T28)', async ({ page }) => {
  await page.goto('/app/plan')
  const first = page.locator('input[type=number]').first()
  await first.fill('1200')

  await page.getByRole('button', { name: '다음', exact: true }).click()
  await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()
  await expect(page).toHaveURL(/\/app\/result$/)

  // 같은 탭으로 돌아오는 상황을 재현한다 — 세션 상태가 살아 있어야 한다
  await page.goto('/app/plan')
  await expect(page.locator('input[type=number]').first()).toHaveValue('1200')
})
