import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'CardFit — 앞으로 쓸 돈으로 카드 조합을 다시 계산합니다',
  description:
    '결혼·이사처럼 예정된 고액 지출을 앞두고, 현재 카드를 유지할지 더 유리한 조합으로 바꿀지 근거와 함께 결정하도록 돕습니다. 예시 데이터로 동작하는 프로토타입입니다.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  )
}
