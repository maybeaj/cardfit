import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * `/` 랜딩 페이지 (UI-011 이전 단계 · `P04-R1`).
 *
 * `src/content/landing.html`을 그대로 내보낸다. 페이지 컴포넌트가 아니라 라우트 핸들러인 이유 —
 * 이 랜딩은 자체 `<html>`·`<head>`(폰트·Tailwind CDN)를 가진 완성된 문서라
 * 앱의 루트 레이아웃 안에 넣으면 문서가 중첩된다. 원본을 손대지 않고 그대로 서빙한다.
 *
 * 공개 진입(`/`)과 서비스 온보딩(`/app`)은 분리한다 — 랜딩의 CTA가 `/app`으로 넘긴다.
 */
export const dynamic = 'force-static'

export async function GET(): Promise<Response> {
  const html = await readFile(join(process.cwd(), 'src', 'content', 'landing.html'), 'utf8')

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
