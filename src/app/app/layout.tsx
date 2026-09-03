import type { ReactNode } from 'react'
import { loadProfile } from '@/server/repository'
import { DemoProvider } from '@/state/store'
import { AppRoutePreloader } from '@/components/app-route-preloader'
import { ErrorNote, PhoneShell, Screen, ScreenHeader } from '@/components/shell'

/**
 * DB를 요청마다 읽는다. 빌드 시점에 구워버리면 Seed 변경이 반영되지 않고
 * TEC-07 Smoke Test가 런타임 경계를 검증하지 못한다.
 */
export const dynamic = 'force-dynamic'

/**
 * 기본 흐름은 마이데이터 CSV 1세트를 이름 없이 로드한다.
 * 프로필 선택 UI를 만들지 않는다 (T17 · P03).
 *
 * `change_case`·`maintain_case`는 계산 정답셋을 고정한 내부 테스트 Fixture로 남기고,
 * 화면은 `transactions.csv`·`cards.csv`·`card_performance.csv`에서 온 실데이터를 쓴다.
 */
const DEFAULT_FIXTURE = 'mydata_csv'

/**
 * 서버 컴포넌트가 Repository로 Profile을 조립해 클라이언트에 내려준다 (TEC-06).
 * Prisma는 이 경계 밖으로 나가지 않는다.
 */
export default async function AppDemoLayout({ children }: { children: ReactNode }) {
  const loaded = await loadProfile(DEFAULT_FIXTURE)

  if (!loaded.ok) {
    // 오류를 성공 결과로 변환하지 않는다 (TEC-05)
    return (
      <PhoneShell>
        <Screen>
          <ScreenHeader title="예시 데이터를 불러오지 못했어요" />
          <ErrorNote>
            {loaded.error.message}
            {loaded.error.missing.length > 0 ? ` (${loaded.error.missing.join(', ')})` : null}
          </ErrorNote>
          <p className="footer">
            로컬에서는 <code>npm run db:start</code> → <code>npm run db:migrate</code> →{' '}
            <code>npm run db:seed</code> 를 실행하면 복구됩니다.
          </p>
        </Screen>
      </PhoneShell>
    )
  }

  return (
    <DemoProvider profile={loaded.data}>
      <AppRoutePreloader />
      <PhoneShell>
        {children}
      </PhoneShell>
    </DemoProvider>
  )
}
