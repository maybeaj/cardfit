import { describe, expect, it } from 'vitest'
import { GET as getProfile } from '@/app/api/profile/route'
import { GET as getSuggestions } from '@/app/api/spends/suggestions/route'
import { POST as calculate } from '@/app/api/calculate/route'
import { GET as getEvidence } from '@/app/api/evidence/route'
import { POST as actionLike } from '@/app/api/action/like/route'

describe('CardFit Backend APIs', () => {
  it('GET /api/profile returns profile data and cards', async () => {
    const req = new Request('http://localhost/api/profile?fixture=mydata_csv')
    const res = await getProfile(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.data.cards.length).toBeGreaterThan(0)
    expect(json.data.summary.past12mSpend).toBeGreaterThan(0)
  })

  it('GET /api/spends/suggestions returns default suggestions and categories', async () => {
    const res = await getSuggestions()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.data.categories).toContain('가전/가구')
    expect(json.data.suggestedSpends.length).toBe(3)
  })

  it('POST /api/calculate returns 3 scenarios and allocations', async () => {
    const req = new Request('http://localhost/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fixtureId: 'mydata_csv',
        spends: [
          { id: 'home', label: '가전/가구', amount: 8400000, spendingMonths: 3, category: '가전/가구' },
          { id: 'travel', label: '여행', amount: 3200000, spendingMonths: 1, category: '여행' },
          { id: 'event', label: '예식', amount: 4800000, spendingMonths: 3, category: '예식' },
        ],
        maxCards: 2,
        includeNew: true,
      }),
    })

    const res = await calculate(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.data.scenarios.expected).toBeDefined()
    expect(json.data.scenarios.low).toBeDefined()
    expect(json.data.scenarios.high).toBeDefined()
    expect(json.data.scenarios.expected.allocations.length).toBeGreaterThan(0)
  })

  it('GET /api/evidence returns audit metrics', async () => {
    const req = new Request('http://localhost/api/evidence?fixture=mydata_csv')
    const res = await getEvidence(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.data.auditMetrics.length).toBe(6)
  })

  it('POST /api/action/like records action and returns next steps', async () => {
    const req = new Request('http://localhost/api/action/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateKey: 'test_candidate' }),
    })
    const res = await actionLike(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.data.nextActions.length).toBeGreaterThan(0)
  })
})
