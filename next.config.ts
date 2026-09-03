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
  /**
   * `/proto`는 기준본 프로토타입(`public/proto.html`)을 그대로 내보낸다.
   *
   * v0.6 문서에서 iPhone 목업(`.device`) 덩어리만 떼어낸 것이다 — 문서용 헤더·흐름
   * 네비게이션·캡션은 뺐다. 앱과 기준본을 같은 주소 체계에서 나란히 열어 대조하려는
   * 것이며, 실 앱(`/app`)을 대체하지 않는다.
   *
   * 백엔드가 필요 없다 — 프로토타입의 계산은 전부 클라이언트 목업이고, 남아있는
   * `fetch`는 실패해도 자체 수치를 쓰는 best-effort 동기화라 `C-TEC-002`(공개 REST
   * 엔드포인트 없음)와 충돌하지 않는다.
   */
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/landing.html' },
        { source: '/proto', destination: '/proto.html' },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
}

export default nextConfig
