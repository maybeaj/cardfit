import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CardFit",
  description: "미래 지출을 반영한 카드 조합 진단",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
