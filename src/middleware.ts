import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** 앱의 모든 화면은 HTML 기준본을 단일 소스로 사용한다. */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/app')) {
    return NextResponse.rewrite(new URL('/prototype', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/app/:path*'] }
