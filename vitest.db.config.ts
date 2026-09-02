import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

/**
 * 서버·데이터 경계 테스트 (TEST_SPEC 5절).
 * 로컬 Supabase가 떠 있어야 하므로 `npm test`와 분리한다.
 *
 * `server-only`는 RSC 밖에서 의도적으로 예외를 던지는 모듈이다. 그 경계는 Next 빌드가
 * 강제하므로(클라이언트에서 import하면 빌드 실패) 테스트에서는 빈 모듈로 대체한다.
 */
export default defineConfig({
  resolve: {
    alias: {
      'server-only': fileURLToPath(new URL('./src/server/__stubs__/server-only.ts', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: { environment: 'node', include: ['src/server/**/*.db-test.ts'], testTimeout: 20_000 },
})
