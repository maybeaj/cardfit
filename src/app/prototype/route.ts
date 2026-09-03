import { readFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * HTML 프로토타입을 앱과 동일한 응답으로 제공한다.
 * 화면 기준본을 React에서 다시 복제하지 않아 `/app/*`와 HTML이 어긋나지 않는다.
 */
export async function GET() {
  const file = path.join(process.cwd(), 'docs', 'prototype', 'cardfit-prd-srs-v0.4.html')
  let html = await readFile(file, 'utf8')
  // 프로토타입 상대 경로를 배포된 카드 이미지 경로로 맞춘다.
  html = html.replaceAll('assets/', '/cards/')
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}
