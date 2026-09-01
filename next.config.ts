import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 백엔드를 만들지 않는다. 모든 계산은 브라우저에서 결정론적으로 실행된다 (ADR-002).
}

export default nextConfig
