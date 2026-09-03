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
  await expect(page.getByText('앞으로의 소비까지 맞춤 계산')).toBeVisible()
  await expect(page.getByRole('heading', { name: /예정된 지출에 맞는/ })).toBeVisible()
  for (const step of ['지금 받은 혜택 확인', '예정된 지출 반영', '더 나을 때만 추천']) {
    await expect(page.getByText(step, { exact: true })).toBeVisible()
  }

  // s1 마이데이터 동의 바텀시트 — 별도 화면이 아니라 온보딩 위에 올라온다
  await page.getByRole('button', { name: '내 카드 조합 찾기' }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet).toBeVisible()
  await expect(sheet.getByRole('heading', { name: /내 카드 정보를/ })).toBeVisible()

  // 필수 3항목을 모두 선택해야 CTA가 열린다
  const submit = sheet.getByRole('button', { name: '동의하고 계속하기' })
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
  // 증감 토글과 감소 입력을 제공하지 않는다 (T10 · UI-002)
  await expect(page.getByText('줄어요')).toHaveCount(0)
  await expect(page.getByText('늘어요')).toHaveCount(0)
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
  const like = page.getByRole('button', { name: '이 조합 선택하기' })
  await like.click()
  const liked = page.getByRole('button', { name: '좋아요를 반영했어요' })
  await expect(liked).toHaveAttribute('aria-pressed', 'true')

  /*
   * 선택하면 **같은 화면에서** 다음 행동이 펼쳐진다. 별도 확정 화면으로 넘어가지 않는다
   * (SRS UI-008 · `T12`). 갈 곳이 없어진 `AC-003`의 경계 고지가 여기 있다.
   */
  await expect(page).toHaveURL(/\/app\/result$/)
  await expect(page.getByRole('heading', { name: '다음에 하면 되는 일' })).toBeVisible()
  await expect(page.getByText(/신청·해지는 카드사에서 직접 진행하셔야 합니다/)).toBeVisible()
  await expect(page.getByText(/해지 실행 버튼 0개/)).toBeVisible()

  // 근거는 결론 카드의 `계산 기준 보기`가 시트로 연다 — 화면을 떠나지 않는다
  await page.getByRole('button', { name: /계산 기준 보기/ }).click()
  const basis = page.getByRole('dialog')
  await expect(basis.getByRole('heading', { name: '혜택을 이렇게 계산했어요' })).toBeVisible()
  await expect(basis.getByText('현재 조합 대비 추가 혜택')).toBeVisible()
  // 상세 근거를 요약 시트에 넣지 않는다 — 더 볼 사람만 전체 근거로 넘어간다
  await expect(basis.getByText('실적구간')).toHaveCount(0)
  await basis.getByRole('link', { name: '전체 근거 보기' }).click()

  // s6 근거 검증 — 6항목
  await expect(page).toHaveURL(/\/app\/evidence$/)
  await expect(page.getByRole('heading', { name: '이 결과가 나온 이유' })).toBeVisible()
  for (const field of ['실적구간', '혜택한도', '연회비', '제외조건', '기준일', '미반영 항목']) {
    await expect(page.getByText(new RegExp(field)).first()).toBeVisible()
  }
  await expect(page.locator('details')).not.toHaveCount(0)
  await expect(page.getByRole('link', { name: /카드사 공식 혜택 확인/ }).first()).toBeVisible()
})

test('별도 확정 화면을 만들지 않는다 (SRS UI-008)', async ({ page }) => {
  const response = await page.goto('/app/confirm')
  expect(response?.status()).toBe(404)
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

  // s5 `계획 수정` → s3
  await page.getByRole('link', { name: '계획 수정' }).click()
  await expect(page).toHaveURL(/\/app\/plan$/)

  await page.goBack()
  await expect(page).toHaveURL(/\/app\/result$/)

  // s6 `결과로 돌아가기` → s5. 근거는 요약 시트를 거쳐 들어간다
  await page.getByRole('button', { name: /계산 기준 보기/ }).click()
  await page.getByRole('link', { name: '전체 근거 보기' }).click()
  await expect(page).toHaveURL(/\/app\/evidence$/)
  await page.getByRole('link', { name: '결과로 돌아가기' }).click()
  await expect(page).toHaveURL(/\/app\/result$/)

  // 시트는 브라우저 뒤로가기로도 닫힌다 — 열어 둔 채 이전 화면으로 나가지 않는다
  await page.getByRole('button', { name: /계산 기준 보기/ }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page).toHaveURL(/\/app\/result$/)
})

test('화면 콘텐츠에 다크 영역을 쓰지 않는다', async ({ page }) => {
  // 기준본의 결론 배너는 다크가 아니라 의미색이다 — 통과=민트, 유지=앰버.
  const countDark = () =>
    page.evaluate(() => {
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

  await page.goto('/app')
  expect(await countDark()).toBe(0)

  /*
   * 입력 화면은 상태에 따라 나타나는 영역이 있어 정적 방문으로는 검사되지 않는다.
   * 바텀시트와 되돌리기 바를 실제로 띄운 뒤 센다 — 기준본은 되돌리기 바를 다크로
   * 칠했고, 그대로 옮기면 결론 배너의 신호값이 죽는다 (`T13`).
   */
  await page.goto('/app/plan')
  await page.getByRole('button', { name: /지출 항목 추가/ }).click()
  await expect(page.getByRole('dialog', { name: '카테고리 선택' })).toBeVisible()
  expect(await countDark()).toBe(0)
  await page.getByRole('button', { name: '닫기' }).click()

  await page.getByRole('button', { name: /항목 삭제$/ }).first().click()
  await expect(page.getByText('되돌리기')).toBeVisible()
  expect(await countDark()).toBe(0)
})

test('지출 탐색 탭이 결론 금액을 다시 계산한다', async ({ page }) => {
  await page.goto('/app/constraint')
  await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()
  await expect(page).toHaveURL(/\/app\/result$/, { timeout: 15_000 })

  const amount = page.locator('.benefit-value')
  await expect(amount).toBeVisible({ timeout: 15_000 })

  // `예상대로`가 기본값이고 확인한 계획 그대로다
  await expect(page.getByRole('button', { name: '예상대로' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  const expected = await amount.innerText()

  /*
   * 다른 시나리오는 규칙 엔진으로 다시 계산한 값이라 금액이 달라진다.
   * 출력에 배수를 곱한 값이면 실적구간·한도가 반영되지 않아 틀린 금액이 된다.
   */
  await page.getByRole('button', { name: '적게' }).click()
  await expect(amount).not.toHaveText(expected)

  await page.getByRole('button', { name: '많이' }).click()
  await expect(amount).not.toHaveText(expected)

  // 어떤 가정의 결과인지 화면에 남는다
  await expect(page.getByText('많이 지출한다고 가정한 결과예요')).toBeVisible()

  // `예상대로`로 돌아오면 원래 값이다
  await page.getByRole('button', { name: '예상대로' }).click()
  await expect(amount).toHaveText(expected)
})

test('결제 배분표가 카드 역할보다 위에 있다 (T2)', async ({ page }) => {
  await page.goto('/app/constraint')
  await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()
  await expect(page).toHaveURL(/\/app\/result$/, { timeout: 15_000 })

  const allocation = page.getByText('이렇게 나눠 쓰세요')
  const roles = page.getByText('카드별 상태')
  await expect(allocation).toBeVisible({ timeout: 15_000 })
  await expect(roles).toBeVisible()

  /*
   * 결과 화면의 주인공은 결제 배분표다 (`T2`). 사용자가 결정할 것은
   * "어느 카드를 쓰냐"가 아니라 "어디에 어느 카드로 결제하냐"라서 위에 와야 한다.
   */
  const allocationTop = (await allocation.boundingBox())?.y ?? 0
  const rolesTop = (await roles.boundingBox())?.y ?? 0
  expect(allocationTop).toBeLessThan(rolesTop)
})
