import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * `/`는 랜딩 페이지(`public/landing.html`)를 그대로 내보낸다.
   *
   * 페이지 컴포넌트로 만들지 않는 이유 — 이 랜딩은 자체 `<html>`·`<head>`(폰트·Tailwind CDN)를
   * 가진 완성된 문서라 앱의 루트 레이아웃 안에 넣으면 문서가 중첩된다.
   *
   * 라우트 핸들러로 파일을 읽지 않는 이유 — 서버리스에서 `process.cwd()`가 가리키는 위치에
   * 의존하게 된다. 정적 자산으로 두면 런타임 파일 접근 자체가 없어 배포 환경을 타지 않는다.
   *
   * 공개 진입(`/`)과 서비스 온보딩(`/app`)은 분리한다 — 랜딩의 CTA가 `/app`으로 넘긴다 (`P04-R1`).
   */
  async rewrites() {
    return {
      beforeFiles: [{ source: '/', destination: '/landing.html' }],
      afterFiles: [],
      fallback: [],
    }
  },
}

export default nextConfig
