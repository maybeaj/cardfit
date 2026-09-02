import { expect, test } from '@playwright/test'

/**
 * v0.4 기준본 플로우 감사 — `docs/prototype/cardfit-prd-srs-v0.4.html`의 s0~s6을
 * 순서대로 통과하며 각 화면의 기준 문구와 계산 결과가 실제로 렌더되는지 확인한다 (`D-011`).
 *
 * 문구·금액을 하드코딩해 비교하는 이유 — `src/content/copy.ts`나 엔진에서 읽어오면
 * 구현이 바뀔 때 테스트도 함께 바뀌어 기준본과의 차이를 잡지 못한다. 기준본이 정본이므로
 * 기준본의 문구와 숫자를 적는다.
 */
test('기준본 s0~s6 플로우를 순서대로 통과한다', async ({ page }) => {
  // s0 온보딩 — 별도 로고 이미지 없이 이용 가치 3단계를 먼저 보여준다 (`P04-R1`)
  await page.goto('/app')
  await expect(page.getByText('카드 선택이 어려운 순간')).toBeVisible()
  await expect(page.getByRole('heading', { name: /앞으로 쓸 돈을 입력하고/ })).toBeVisible()
  for (const step of [
    '받아온 혜택을 확인해요',
    '앞으로의 지출을 반영해요',
    '바꿀 가치가 있을 때만 추천해요',
  ]) {
    await expect(page.getByText(step)).toBeVisible()
  }
  // 동의 체크박스는 시트 안에 있고 이 화면에는 없다
  await expect(page.locator('input[type=checkbox]')).toHaveCount(0)

  // s1 마이데이터 동의 바텀시트 — 별도 화면이 아니라 온보딩 위에 올라온다 (`P04-R2`)
  await page.getByRole('button', { name: '카드조합 추천받기' }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet).toBeVisible()
  await expect(sheet.getByRole('heading', { name: '마이데이터 이용 동의하기' })).toBeVisible()

  // 필수 3항목을 모두 선택해야 CTA가 열린다
  const submit = sheet.getByRole('button', { name: '마이데이터 이용 동의하기' })
  await expect(submit).toBeDisabled()
  await sheet.getByRole('checkbox').first().check() // 전체 동의
  await expect(submit).toBeEnabled()
  await submit.click()

  // s2 현재 카드와 혜택 확인 — 지표 2개 + 보유 카드 아코디언 (AC-012)
  await expect(page).toHaveURL(/\/app\/summary$/)
  await expect(page.getByRole('heading', { name: /지금 가지고 있는 카드부터/ })).toBeVisible()
  await expect(page.getByText('최근 12개월 지출액')).toBeVisible()
  await expect(page.getByText('₩12,480,000')).toBeVisible()
  await expect(page.getByText('최근 12개월 받은 혜택')).toBeVisible()
  await expect(page.getByText('₩486,000')).toBeVisible()
  // 진단 화면에 금액 결론을 띄우지 않는다 (`T5`) — 조합 상태 배지가 0개다
  await expect(page.locator('.state-pill')).toHaveCount(0)

  // 지출액은 숨김·보기 전환이 된다
  await page.getByRole('button', { name: /숨기기/ }).click()
  await expect(page.getByText('••••••••')).toBeVisible()
  await page.getByRole('button', { name: /보기/ }).click()

  // 카드를 누르면 주요 혜택 4개가 펼쳐진다
  await page.getByRole('button', { name: /신한 Mr\.Life/ }).click()
  await expect(page.getByText('신한 Mr.Life 주요 혜택')).toBeVisible()
  await expect(page.getByText('편의점 10% 할인')).toBeVisible()

  await page.getByRole('link', { name: '앞으로 쓸 돈 반영하기' }).click()

  // s3 미래 지출 확인 — 빈 폼이 아니다 (`T3` · FR-006)
  await expect(page).toHaveURL(/\/app\/plan$/)
  await expect(page.getByRole('heading', { name: '예상되는 지출액을 입력해주세요.' })).toBeVisible()
  await expect(page.locator('input[type=number]')).toHaveCount(3)
  // 증감 토글과 감소 입력은 제공하지 않는다 (`T10`)
  await expect(page.getByText('줄어요')).toHaveCount(0)
  // 지출 기간 선택지는 `한 번에 / 3개월 / 6개월 / 12개월`이다 (UI-002)
  await expect(page.getByRole('group', { name: '가전/가구 지출 기간' }).getByRole('button')).toHaveCount(4)
  // 만원 단위를 원으로 되읽어 준다 — 자릿수 오입력을 막는다
  await expect(page.getByText('₩8,400,000')).toBeVisible()
  // 진행 버튼이 스크롤 없이 보인다 (고정 CTA)
  await expect(page.getByRole('button', { name: '다음', exact: true })).toBeInViewport()
  await page.getByRole('button', { name: '다음', exact: true }).click()

  // s4 계산 조건 — 기본값 2장·신규 포함 `예`
  await expect(page).toHaveURL(/\/app\/constraint$/)
  await expect(page.getByRole('heading', { name: '어느 정도까지 바꿔도 괜찮나요?' })).toBeVisible()
  await expect(page.getByText('최대 카드 수')).toBeVisible()
  await expect(page.getByText('신규 카드 포함 여부')).toBeVisible()
  await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()

  // s5 결과 — 기준본의 `예상대로` 값과 일치해야 한다
  await expect(page).toHaveURL(/\/app\/result$/)
  await expect(page.getByText('이 조합으로 받을 수 있는 연간 혜택')).toBeVisible()
  await expect(page.getByText('₩2,143,000').first()).toBeVisible()
  await expect(page.getByText('현재 카드 조합보다 ₩1,657,000 더 받아요')).toBeVisible()
  // 카드마다 신규·유지·정리 중 하나씩, 신규는 최대 1장 (`T6` · AC-005)
  await expect(page.locator('.state-pill')).toHaveCount(3)
  await expect(page.locator('.state-pill.new')).toHaveCount(1)
  // `정리` 카드에는 실행 버튼을 두지 않는다 (AC-003)
  await expect(page.locator('.result-card.status-organize a')).toHaveCount(0)

  // 배분표가 본문이고 배분 합은 확인한 계획과 같다 (FR-004 · NFR-001)
  await expect(page.getByRole('heading', { name: '이렇게 나눠 쓰세요' })).toBeVisible()
  await expect(page.locator('.allocation-row')).toHaveCount(3)
  await expect(page.getByText('₩16,400,000')).toBeVisible()
  // `정리` 카드에는 배분하지 않는다
  await expect(page.locator('.allocation-card').getByText('삼성카드 taptap O')).toHaveCount(0)

  // 시나리오를 바꾸면 조합과 금액이 함께 교체된다 (AC-014)
  await page.getByRole('button', { name: /적게/ }).click()
  await expect(page.getByText('₩1,646,000')).toBeVisible()
  await page.getByRole('button', { name: /예상대로/ }).click()
  await expect(page.getByText('₩2,143,000').first()).toBeVisible()

  // 요약 근거 바텀시트 → 상세 근거
  await page.getByRole('button', { name: /왜 이 금액인가요/ }).click()
  const evidenceSheet = page.getByRole('dialog')
  await expect(evidenceSheet.getByRole('heading', { name: '혜택을 이렇게 계산했어요' })).toBeVisible()
  await expect(evidenceSheet.getByText('연회비')).toBeVisible()
  await evidenceSheet.getByRole('button', { name: '전체 근거 보기' }).click()

  // s6 상세 근거 — 근거 6항목이 모두 있어야 결과를 노출한다 (AC-002)
  await expect(page).toHaveURL(/\/app\/evidence$/)
  for (const field of ['실적구간', '혜택한도', '연회비', '제외조건', '기준일', '미반영 항목']) {
    await expect(page.getByText(field, { exact: false }).first()).toBeVisible()
  }
  await expect(page.getByText('예상대로 지출을 이렇게 반영했어요')).toBeVisible()
  await expect(page.getByRole('link', { name: /카드사 공식 혜택 확인/ }).first()).toBeVisible()

  // 결과로 돌아가 조합 선호를 남긴다 — 북극성의 분자다 (FR-008 · AC-008)
  await page.getByRole('link', { name: '결과로 돌아가기' }).click()
  await expect(page).toHaveURL(/\/app\/result$/)
  const like = page.getByRole('button', { name: '이 조합 좋아요' })
  await like.click()
  await expect(page.getByRole('button', { name: '좋아요를 반영했어요' })).toBeVisible()
  // 별도 확정 화면으로 이동하지 않는다
  await expect(page).toHaveURL(/\/app\/result$/)
})

test('확인할 미래 계획이 0건이면 다음으로 넘어가지 않는다 (G2 · AC-001)', async ({ page }) => {
  await page.goto('/app/plan')

  for (const input of await page.locator('input[type=number]').all()) {
    await input.fill('0')
  }

  await expect(page.getByText('앞으로 쓸 돈을 입력하면 카드 조합을 확인할 수 있어요.')).toBeVisible()
  await expect(page.getByRole('button', { name: '다음', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: '이 단계 건너뛰기' })).toBeDisabled()
})

test('임계 미달이면 현재 조합 유지를 정상 결과로 돌려준다 (AC-004)', async ({ page }) => {
  await page.goto('/app/plan')

  const inputs = await page.locator('input[type=number]').all()
  await inputs[0]!.fill('3')
  await inputs[1]!.fill('0')
  await inputs[2]!.fill('0')

  await page.getByRole('button', { name: '다음', exact: true }).click()
  await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()

  await expect(page.getByText('현재 조합 유지')).toBeVisible()
  await expect(page.getByText('바꾸는 비용보다 추가 혜택이 작아요')).toBeVisible()
  // 유지 결론에서도 배분을 비우지 않는다 (`T21`) — 카드 3장이 모두 `유지`다
  await expect(page.locator('.state-pill.keep')).toHaveCount(3)
  await expect(page.locator('.state-pill.new')).toHaveCount(0)
})

test('지운 항목을 되돌릴 수 있다', async ({ page }) => {
  await page.goto('/app/plan')
  await expect(page.locator('input[type=number]')).toHaveCount(3)

  await page.getByRole('button', { name: '여행 항목 삭제' }).click()
  await expect(page.locator('input[type=number]')).toHaveCount(2)
  await expect(page.getByText('여행 항목을 지웠어요')).toBeVisible()

  await page.getByRole('button', { name: '되돌리기' }).click()
  await expect(page.locator('input[type=number]')).toHaveCount(3)
  // 지운 자리에 그대로 돌아온다
  await expect(page.locator('.spend').nth(1).getByRole('combobox')).toHaveValue('여행')
})
