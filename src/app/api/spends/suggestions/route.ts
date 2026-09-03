import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DEFAULT_CATEGORIES = [
  '여행',
  '주유',
  '교통',
  '쇼핑',
  '음식/배달',
  '통신',
  '카페',
  '구독',
  '전 가맹점',
  '간편결제',
  '편의점',
  '마트',
  '생활',
  '백화점',
  '가전/가구',
  '예식',
  '기타',
]

const DEFAULT_SUGGESTIONS = [
  { id: 'home', label: '가전/가구', amount: 8400000, spendingMonths: 3, category: '가전/가구' },
  { id: 'travel', label: '여행', amount: 3200000, spendingMonths: 1, category: '여행' },
  { id: 'event', label: '예식', amount: 4800000, spendingMonths: 3, category: '예식' },
]

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: {
      categories: DEFAULT_CATEGORIES,
      suggestedSpends: DEFAULT_SUGGESTIONS,
    },
  })
}
