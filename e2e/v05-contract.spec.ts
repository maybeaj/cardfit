import { expect, test } from '@playwright/test'

/**
 * v0.5 UI 계약 — `docs/ux/v05-contract/`의 최종 렌더 상태와 화면을 대조한다.
 *
 * 기준본과 픽셀을 맞추지는 않는다. 프로토타입은 신한 Mr.Life·taptap O·Deep Oil을 쓰고
 * 앱은 마이데이터 CSV의 다른 카드를 쓰므로 이미지는 영원히 다르다. 대신 **각 상태에
 * 무엇이 있어야 하는가**를 단언한다 — *"마이데이터 동의는 구현했습니다"*가 시트만 뜨는
 * 것으로 끝나지 않게, 안의 체크박스·펼침 상세·문구·버튼까지 본다.
 *
 * 계약이 바뀌면 `npm run ux:contract`로 산출물을 다시 뽑고 이 파일을 함께 고친다.
 */

test.describe('v0.5 화면 계약', () => {
  test('01 온보딩 — 3단계와 CTA만 남는다', async ({ page }) => {
    await page.goto('/app')

    await expect(page.getByText('앞으로의 소비까지 맞춤 계산')).toBeVisible()
    await expect(page.getByRole('heading', { name: /예정된 지출에 맞는/ })).toBeVisible()

    for (const [title, body] of [
      ['지금 받은 혜택 확인', '최근 소비와 카드 혜택을 살펴봐요.'],
      ['예정된 지출 반영', '여행이나 예식처럼 큰 지출을 더해요.'],
      ['더 나을 때만 추천', '바꿨을 때 늘어나는 혜택을 비교해요.'],
    ]) {
      await expect(page.getByText(title!, { exact: true })).toBeVisible()
      await expect(page.getByText(body!, { exact: true })).toBeVisible()
    }

    await expect(page.getByRole('button', { name: '내 카드 조합 찾기' })).toBeVisible()
    // `UX review`가 걷어낸 것들 — 부연 문단과 하단 안내는 남기지 않는다
    await expect(page.locator('.onboarding-copy')).toHaveCount(0)
    await expect(page.locator('.step-icon')).toHaveCount(0)
  })

  test('02·03 마이데이터 동의 — 필수 2항목과 그 자리에서 펼치는 상세', async ({ page }) => {
    await page.goto('/app')
    await page.getByRole('button', { name: '내 카드 조합 찾기' }).click()

    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible()
    await expect(sheet.getByText('마이데이터 연결', { exact: true })).toBeVisible()
    await expect(sheet.getByRole('heading', { name: /내 카드 정보를/ })).toBeVisible()

    // 필수는 2개다. 3개짜리 중간 버전이 되살아나면 여기서 걸린다
    await expect(sheet.locator('.consent-row')).toHaveCount(2)
    await expect(sheet.getByText('개인신용정보 수집·이용')).toBeVisible()
    await expect(sheet.getByText('개인신용정보 전송요구')).toBeVisible()
    // 약관 전문 링크를 두지 않는다 — 없는 문서를 있는 것처럼 걸지 않는다
    await expect(sheet.getByText('전문 보기')).toHaveCount(0)

    // 상세는 링크로 빼지 않고 시트 안에서 펼친다
    const details = sheet.locator('details')
    await expect(details).toHaveCount(2)
    await details.first().locator('summary').click()
    await expect(sheet.getByText('이용 목적', { exact: true })).toBeVisible()
    await expect(sheet.getByText('보유 기간', { exact: true })).toBeVisible()

    await expect(sheet.getByText('언제든지 마이데이터 연결을 해제할 수 있어요.')).toBeVisible()

    const submit = sheet.getByRole('button', { name: '동의하고 계속하기' })
    await expect(submit).toBeDisabled()
    await sheet.getByRole('checkbox').first().check()
    await expect(submit).toBeEnabled()
  })

  test('06 카테고리 선택 — 7묶음 바텀시트', async ({ page }) => {
    await page.goto('/app/plan')
    await page.getByRole('button', { name: /지출 항목 추가/ }).click()

    const sheet = page.getByRole('dialog', { name: '카테고리 선택' })
    await expect(sheet).toBeVisible()
    for (const group of ['여행', '교통·차량', '쇼핑·생활', '식비·여가', '통신', '이벤트', '기타']) {
      await expect(sheet.locator('summary', { hasText: group })).toHaveCount(1)
    }
  })

  test('08 결과 — 배분표가 카드 역할보다 위에 있다 (T2 · UI-006)', async ({ page }) => {
    await page.goto('/app/constraint')
    await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()
    await expect(page).toHaveURL(/\/app\/result$/, { timeout: 15_000 })

    /*
     * 기준본은 `카드별 역할` 제목에 `order:2`를 걸어 자기 목록(`order:6`)과 떼어 놓고
     * 배분표 위로 띄운다. 제목과 내용이 분리된 프로토타입 쪽 버그라 따라가지 않는다 —
     * SRS UI-006이 "배분표를 결론 바로 아래, 카드별 역할은 그 아래"로 못박고 있다.
     */
    const allocation = await page.getByText('이렇게 나눠 쓰세요').boundingBox()
    const roles = await page.getByText('카드별 상태').boundingBox()
    expect(allocation!.y).toBeLessThan(roles!.y)
  })

  test('08 결론 카드 — 총 혜택은 늘어나는 혜택보다 크다', async ({ page }) => {
    await page.goto('/app/constraint')
    await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()
    await expect(page).toHaveURL(/\/app\/result$/, { timeout: 15_000 })

    /*
     * 크게 세우는 값은 **늘어나는 혜택**이고 총액은 뱃지다 (v0.5). 두 값을 뒤집으면
     * 총액이 차액보다 작아져 화면이 스스로 모순된다 — 라벨만 바꾸고 값을 그대로 둔
     * 적이 있어 숫자로 고정해 둔다.
     */
    const won = (text: string) => Number(text.replace(/[^0-9]/g, ''))
    const increase = won((await page.locator('.benefit-value').innerText()) ?? '')
    const total = won((await page.locator('.benefit-delta').innerText()) ?? '')
    expect(total).toBeGreaterThan(increase)
  })

  test('09 계산 기준 — 요약만 담고 상세는 담지 않는다 (UI-007)', async ({ page }) => {
    await page.goto('/app/constraint')
    await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()
    await expect(page).toHaveURL(/\/app\/result$/, { timeout: 15_000 })

    await page.getByRole('button', { name: /계산 기준 보기/ }).click()
    const sheet = page.getByRole('dialog')
    await expect(sheet.getByRole('heading', { name: '혜택을 이렇게 계산했어요' })).toBeVisible()
    await expect(sheet.getByText('현재 조합 대비 추가 혜택')).toBeVisible()
    await expect(sheet.getByText('계산 기준')).toBeVisible()
    await expect(sheet.getByText('앞으로 12개월')).toBeVisible()

    // 상세 근거를 시트에 넣으면 상세 화면이 따로 있을 이유가 없어진다
    await expect(sheet.getByText('실적구간')).toHaveCount(0)
    await expect(sheet.getByText('제외조건')).toHaveCount(0)

    await expect(sheet.getByRole('link', { name: '전체 근거 보기' })).toBeVisible()
  })

  test('10 선택 이후 — 같은 화면에서 다음 행동이 펼쳐진다 (UI-008 · AC-003)', async ({ page }) => {
    await page.goto('/app/constraint')
    await page.getByRole('button', { name: '이 계획대로 계산하기' }).click()
    await expect(page).toHaveURL(/\/app\/result$/, { timeout: 15_000 })

    await expect(page.getByRole('heading', { name: '다음에 하면 되는 일' })).toHaveCount(0)
    await page.getByRole('button', { name: '이 조합 선택하기' }).click()

    // 화면을 옮기지 않는다
    await expect(page).toHaveURL(/\/app\/result$/)
    await expect(page.getByRole('heading', { name: '다음에 하면 되는 일' })).toBeVisible()
    await expect(page.getByText(/해지 실행 버튼 0개/)).toBeVisible()
  })

  test('모든 시트가 같은 방식으로 닫힌다', async ({ page }) => {
    await page.goto('/app/plan')
    const open = () => page.getByRole('button', { name: /지출 항목 추가/ }).click()
    const sheet = page.getByRole('dialog')

    await open()
    await page.getByRole('button', { name: '닫기' }).click()
    await expect(sheet).toHaveCount(0)

    await open()
    await page.keyboard.press('Escape')
    await expect(sheet).toHaveCount(0)

    // 뒤로가기로 닫힌다 — 시트를 열어 둔 채 이전 화면으로 나가지 않는다
    await open()
    await page.goBack()
    await expect(sheet).toHaveCount(0)
    await expect(page).toHaveURL(/\/app\/plan$/)
  })
})
