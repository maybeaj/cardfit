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
  await expect(page.getByText('앞으로의 소비까지 맞춤 계산')).toBeVisible()
  await expect(page.locator('input[type=checkbox]')).toHaveCount(0)
  await page.getByRole('button', { name: '내 카드 조합 찾기' }).click()

  // s1 마이데이터 이용 동의 — 필수 2항목을 모두 선택해야 열린다
  const sheet = page.getByRole('dialog')
  const submit = sheet.getByRole('button', { name: '동의하고 계속하기' })
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
  // 결론 카드는 늘어나는 금액을 크게 세우고 총액을 보조로 둔다 (v0.5)
  await expect(page.getByText('현재보다 늘어나는 연간 혜택')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('총 예상 혜택', { exact: false })).toBeVisible()
  await expect(page.getByText('현재 조합 3장을 그대로 쓸 때와 비교', { exact: false })).toBeVisible()
  await expect(page.getByText('이렇게 나눠 쓰세요')).toBeVisible()

  // 금지어 0건
  const resultText = (await page.locator('body').innerText()) ?? ''
  for (const banned of ['총혜택', '최대혜택', '놓쳤어요', '손해보고 있어요']) {
    expect(resultText).not.toContain(banned)
  }

  /*
   * `계산 기준 보기`는 **요약 시트**를 연다. 금액이 어디서 왔는지 몇 줄로 보이고 끝난다 —
   * 카드별 실적구간 표는 여기 넣지 않는다. 그럴 거면 상세 화면이 따로 있을 이유가 없다.
   */
  await page.getByRole('button', { name: /계산 기준 보기/ }).click()
  const basis = page.getByRole('dialog')
  await expect(basis).toBeVisible()
  await expect(basis.getByText('현재 조합 대비 추가 혜택')).toBeVisible()
  await expect(basis.getByText('계산 기준')).toBeVisible()
  await expect(basis.getByText('실적구간')).toHaveCount(0)
  // `getByRole`의 이름은 부분 일치라 머리의 `시트 닫기`까지 걸린다
  await basis.getByRole('button', { name: '닫기', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  // 전체 근거는 요약 시트를 거쳐 들어간다
  await page.getByRole('button', { name: /계산 기준 보기/ }).click()
  await page.getByRole('link', { name: '전체 근거 보기' }).click()

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
  await page.getByRole('link', { name: '결과로 돌아가기' }).click()

  /*
   * 종착 행동 — 선택하면 같은 화면에서 다음 행동이 펼쳐진다 (AC-003 · AC-008).
   * 아웃링크 1개, 해지 실행 버튼 0개.
   */
  await page.getByRole('button', { name: '이 조합 선택하기' }).click()
  await expect(page.getByRole('heading', { name: '다음에 하면 되는 일' })).toBeVisible()
  await expect(page.getByText('신청·해지는 카드사에서 직접 진행하셔야 합니다', { exact: false })).toBeVisible()
  /*
   * 경계 문구가 세는 것은 **다음 행동 블록의** 아웃링크다. 카드별 역할 목록에도 신규
   * 카드의 공식 페이지 링크가 따로 있어 화면 전체로는 2개다 — 기준본도 같다.
   * 세는 범위와 표기가 어긋나지 않는지 함께 본다.
   */
  const nextActions = page.locator('.next-actions')
  await expect(nextActions.locator('a[target=_blank]')).toHaveCount(1)
  await expect(page.getByText('아웃링크 1개 · 해지 실행 버튼 0개', { exact: false })).toBeVisible()
  // 해지 실행 버튼은 어디에도 없다 (AC-003)
  await expect(page.getByRole('button', { name: /해지/ })).toHaveCount(0)
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

  // ＋ 지출 항목 추가 → 카테고리 바텀시트 → 카테고리 선택
  await expect(page.locator('input[type=number]')).toHaveCount(3)
  await page.getByRole('button', { name: /지출 항목 추가/ }).click()
  const sheet = page.getByRole('dialog', { name: '카테고리 선택' })
  await expect(sheet).toBeVisible()
  await sheet.locator('summary', { hasText: '여행' }).click()
  await sheet.getByRole('button', { name: '여행', exact: true }).click()
  await expect(sheet).toHaveCount(0)
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
