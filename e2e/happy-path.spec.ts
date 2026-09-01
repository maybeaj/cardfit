import { expect, test } from '@playwright/test'

/** QA-02 — change_case Happy Path. 402×874와 1440×900 두 폭에서 완주한다 (NFR-003). */
test('랜딩에서 앱 데모로 들어가 조합을 확정한다', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('앞으로 쓸 돈')
  await page.getByRole('link', { name: '앱 데모 시연하기' }).first().click()

  // O 온보딩 — 예시 데이터 고지, 동의 체크박스 0개 (AC-011)
  await expect(page.getByText('예시 데이터로 동작합니다')).toBeVisible()
  await expect(page.locator('input[type=checkbox]')).toHaveCount(0)
  await page.getByRole('link', { name: '시작하기' }).click()

  // M 마이데이터 안내
  await page.getByRole('button', { name: '예시 데이터 연결하기' }).click()
  await expect(page.getByText('예시 데이터 불러오기 완료')).toBeVisible()
  await page.getByRole('button', { name: '현재 혜택 보기' }).click()

  // 0 현재 혜택 요약 — 두 라벨 동시 노출, 최종 조합 0건 (AC-012)
  await expect(page.getByText('최근 12개월 소비 기준').first()).toBeVisible()
  await expect(page.getByText('앞으로의 지출은 아직 반영되지 않았어요')).toBeVisible()
  await expect(page.getByText('정리', { exact: true })).toHaveCount(0)
  await page.getByRole('link', { name: '내 카드 분석 보기' }).click()

  // 1 현재 카드 진단
  await expect(page.getByText('앞으로의 지출은 아직 반영되지 않았어요')).toBeVisible()
  await page.getByRole('link', { name: '앞으로 쓸 돈 반영하기' }).click()

  // 2 입력 — 빈 폼이 아니다 (T3)
  await expect(page.getByText('최근 소비 패턴으로 미리 채웠습니다', { exact: false })).toBeVisible()
  await expect(page.locator('input[type=number]')).toHaveCount(3)
  await page.getByRole('link', { name: '다음' }).click()

  // 3 변경 조건
  await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()

  // 4 결과 — 결론 배너 + 배분표
  await expect(page.getByText('지금 조합 그대로면')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('연 186,000원을 덜 받습니다')).toBeVisible()
  await expect(page.getByText('현재 조합 3장을 그대로 쓸 때와 비교', { exact: false })).toBeVisible()
  await expect(page.getByText('이렇게 나눠 쓰세요')).toBeVisible()
  await expect(page.getByText('사용 카드 2장 · 신규 1장 이내에서의 최선')).toBeVisible()

  // 금지어 0건
  const resultText = (await page.locator('body').innerText()) ?? ''
  for (const banned of ['총혜택', '최대혜택', '놓쳤어요', '손해보고 있어요']) {
    expect(resultText).not.toContain(banned)
  }

  await page.getByRole('link', { name: '왜 이런 결과인지 보기' }).click()

  // 5 근거 — 6항목
  for (const field of ['실적구간', '혜택한도', '연회비', '제외조건', '기준일', '계산에 포함되지 않은 항목']) {
    await expect(page.getByText(field, { exact: false }).first()).toBeVisible()
  }
  await page.getByRole('button', { name: '이 조합 적용하기' }).click()

  // 6 확정 + 경계 — 아웃링크 1개, 해지 실행 버튼 0개 (AC-003 · AC-008)
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

  await expect(page.getByText('확인할 앞으로의 지출이 0건이라 계산하지 않습니다')).toBeVisible()
  await expect(page.getByRole('button', { name: '다음' })).toBeDisabled()

  await page.getByRole('button', { name: '과거 패턴으로 다시 채우기' }).click()
  await expect(page.locator('input[type=number]')).toHaveCount(3)
})

test('탭 네비게이션을 그리지 않는다 (T14)', async ({ page }) => {
  for (const path of ['/app', '/app/summary', '/app/plan']) {
    await page.goto(path)
    await expect(page.locator('nav')).toHaveCount(0)
  }
})
