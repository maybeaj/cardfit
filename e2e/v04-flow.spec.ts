import { expect, test } from '@playwright/test'

/**
 * v0.4 기준본 플로우 감사 — `docs/prototype/cardfit-prd-srs-v0.4.html`의 s0~s7을
 * 순서대로 통과하며 각 화면의 기준 문구가 실제로 렌더되는지 확인한다 (`D-011`).
 *
 * 문구를 하드코딩해 비교하는 이유 — `src/content/copy.ts`에서 읽어오면 카피를 바꿔도
 * 테스트가 함께 바뀌어 기준본과의 차이를 잡지 못한다. 기준본이 정본이므로 기준본 문구를 적는다.
 */
test('기준본 s0~s7 플로우를 순서대로 통과한다', async ({ page }) => {
  // s0 온보딩
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

  // s1 마이데이터 동의 바텀시트 — 별도 화면이 아니라 온보딩 위에 올라온다
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

  // s2 현재 카드와 혜택 확인 — 지표 2개 + 보유 카드 아코디언
  await expect(page).toHaveURL(/\/app\/summary$/)
  await expect(page.getByRole('heading', { name: /지금 가지고 있는 카드부터/ })).toBeVisible()
  await expect(page.getByText('최근 12개월 지출액')).toBeVisible()
  await expect(page.getByText('최근 12개월 받은 혜택')).toBeVisible()

  // 마이데이터 CSV의 실제 카드가 보인다
  await expect(page.getByText('신한카드 Deep Dream')).toBeVisible()
  await expect(page.getByText('삼성 taptap O')).toBeVisible()

  // 카드를 누르면 주요 혜택이 펼쳐진다
  const firstCard = page.getByRole('button', { expanded: false }).first()
  await firstCard.click()
  await expect(page.getByText('주요 혜택').first()).toBeVisible()

  await page.getByRole('link', { name: '앞으로 쓸 돈 반영하기' }).click()

  // s3 미래 지출 확인
  await expect(page).toHaveURL(/\/app\/plan$/)
  await expect(page.getByRole('heading', { name: /예상되는 지출액을 입력해주세요/ })).toBeVisible()
  // 지출 감소는 항목별 토글로 받는다 — 금액 칸에 마이너스를 직접 입력받지 않는다 (`T20`)
  await expect(page.getByText('늘어요').first()).toBeVisible()
  await expect(page.getByText('줄어요').first()).toBeVisible()
  await page.getByRole('link', { name: '다음' }).click()

  // s4 계산 조건 — 스테퍼와 예/아니오
  await expect(page).toHaveURL(/\/app\/constraint$/)
  await expect(page.getByRole('heading', { name: /어느 정도까지 바꿔도 괜찮나요/ })).toBeVisible()
  await expect(page.getByText('사용 카드 최대 수')).toBeVisible()
  await expect(page.getByText('신규 카드 포함')).toBeVisible()
  await expect(page.getByRole('button', { name: '사용 카드 최대 수 늘리기' })).toBeVisible()
  await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()

  // s5 계산 결과 — 결론 배너 + 지출 탐색 + 카드별 상태 + 배분표
  await expect(page).toHaveURL(/\/app\/result$/, { timeout: 15_000 })
  await expect(
    page.getByRole('heading', { name: '확인한 앞으로 12개월 계획 기준 결과' }),
  ).toBeVisible({ timeout: 15_000 })
  for (const label of ['적게', '예상대로', '많이']) {
    await expect(page.getByRole('button', { name: label })).toBeVisible()
  }
  await expect(page.getByText('카드별 상태')).toBeVisible()
  const like = page.getByRole('button', { name: '이 조합 좋아요' })
  await like.click()
  const liked = page.getByRole('button', { name: '좋아요를 반영했어요' })
  await expect(liked).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('link', { name: '계산 근거 보기' }).click()

  // s6 근거 검증 — 6항목
  await expect(page).toHaveURL(/\/app\/evidence$/)
  await expect(page.getByRole('heading', { name: '이 결과가 나온 이유' })).toBeVisible()
  for (const field of ['실적구간', '혜택한도', '연회비', '제외조건', '기준일', '미반영 항목']) {
    await expect(page.getByText(new RegExp(field)).first()).toBeVisible()
  }
  await expect(page.locator('details')).not.toHaveCount(0)
  await expect(page.getByRole('link', { name: /카드사 공식 혜택 확인/ }).first()).toBeVisible()
  await page.getByRole('button', { name: '이 조합 확정하기' }).click()

  // s7 확정 및 실행 경계 — 해지 항목에 실행 버튼을 두지 않는다
  await expect(page).toHaveURL(/\/app\/confirm$/)
  await expect(page.getByRole('heading', { name: '확정한 조합과 다음 행동' })).toBeVisible()
  await expect(page.getByText('카드별 다음 행동')).toBeVisible()
  await expect(page.getByText('CardFit의 실행 경계')).toBeVisible()
})

test('하드웨어 목업 없이 모바일 웹 셸로 렌더된다', async ({ page }) => {
  await page.goto('/app')
  await expect(page.locator('.mobile-shell')).toBeVisible()
  await expect(page.locator('.device, .island, .statusbar, .homebar')).toHaveCount(0)
  await expect(page.getByRole('progressbar')).toHaveCount(0)
  const width = await page.locator('.mobile-shell').evaluate((element) =>
    Math.round(element.getBoundingClientRect().width),
  )
  expect(width).toBeLessThanOrEqual(430)
})

test('결과에서 뒤로 가는 버튼들이 기준본과 같은 곳으로 간다', async ({ page }) => {
  // 계산 상태를 만들기 위해 흐름을 통과한다
  await page.goto('/app/constraint')
  await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()
  await expect(page).toHaveURL(/\/app\/result$/, { timeout: 15_000 })

  // s5 `계획 수정하기` → s3
  await page.getByRole('link', { name: '계획 수정하기' }).click()
  await expect(page).toHaveURL(/\/app\/plan$/)

  await page.goBack()
  await expect(page).toHaveURL(/\/app\/result$/)

  // s6 `결과로 돌아가기` → s5
  await page.getByRole('link', { name: '계산 근거 보기' }).click()
  await expect(page).toHaveURL(/\/app\/evidence$/)
  await page.getByRole('link', { name: '결과로 돌아가기' }).click()
  await expect(page).toHaveURL(/\/app\/result$/)

  // s7 `다시 검토하기` → s5
  await page.getByRole('link', { name: '계산 근거 보기' }).click()
  await page.getByRole('button', { name: '이 조합 확정하기' }).click()
  await expect(page).toHaveURL(/\/app\/confirm$/)
  await page.getByRole('link', { name: '다시 검토하기' }).click()
  await expect(page).toHaveURL(/\/app\/result$/)
})

test('화면 콘텐츠에 다크 영역을 쓰지 않는다', async ({ page }) => {
  // 기준본의 결론 배너는 다크가 아니라 의미색이다 — 통과=민트, 유지=앰버.
  await page.goto('/app')
  const darkCount = await page.evaluate(() => {
    const isDark = (color: string) => {
      const match = color.match(/\d+/g)
      if (!match || match.length < 3) return false
      const [r, g, b] = match.map(Number) as [number, number, number]
      // 알파가 0이면 칠해지지 않은 것이다
      if (match.length > 3 && Number(match[3]) === 0) return false
      return 0.299 * r + 0.587 * g + 0.114 * b < 90
    }
    return [...document.querySelectorAll('.mobile-shell *')].filter((el) => {
      const bg = getComputedStyle(el).backgroundColor
      return bg && bg !== 'transparent' && isDark(bg)
    }).length
  })
  expect(darkCount).toBe(0)
})
