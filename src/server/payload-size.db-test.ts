import { it } from 'vitest'
import { loadProfile } from '@/server/repositories/profile.repository'
import { calculateForMultiplier, engine } from '@/domain/cardfit/recommendation'

const size = (v: unknown) => Buffer.byteLength(JSON.stringify(v ?? null), 'utf8')
const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`

it('페이로드 크기', async () => {
  const loaded = await loadProfile('mydata_csv')
  if (!loaded.ok) throw new Error(JSON.stringify(loaded.error))
  const profile = loaded.data

  console.log('── Profile (레이아웃이 클라이언트로 내려보내는 값) ──')
  console.log('profile 전체            ', kb(size(profile)))
  console.log('  cards       ', profile.cards.length, '장 ', kb(size(profile.cards)))
  console.log('  rules       ', profile.rules.length, '건 ', kb(size(profile.rules)))
  console.log('  past_spend  ', profile.past_spend.length, '행 ', kb(size(profile.past_spend)))
  console.log('  suggested   ', profile.suggested_plan.length, '건 ', kb(size(profile.suggested_plan)))

  const input = { profile, plan: profile.suggested_plan, constraint: profile.constraint }
  const result = engine.calculate(input)
  if (!result.ok) throw new Error(result.reason)
  const c = result.calculation

  console.log('\n── Calculation 1건 ──')
  console.log('calculation 전체        ', kb(size(c)))
  for (const [key, value] of Object.entries(c)) {
    const count = Array.isArray(value) ? `${value.length}건` : ''
    console.log(`  ${key.padEnd(22)} ${kb(size(value)).padStart(9)}  ${count}`)
  }
  console.log('  chosen.allocations   ', c.chosen.allocations.length, '행', kb(size(c.chosen.allocations)))
  console.log('  current.allocations  ', c.current.allocations.length, '행', kb(size(c.current.allocations)))
  console.log(
    '  reviewed allocations ',
    c.reviewed.reduce((n, r) => n + r.allocations.length, 0),
    '행',
    kb(c.reviewed.reduce((n, r) => n + size(r.allocations), 0)),
  )

  const low = calculateForMultiplier(input, 0.72)
  const high = calculateForMultiplier(input, 1.28)
  const payload = {
    calculationId: 'x'.repeat(36),
    calculation: c,
    scenarios: {
      low: low.ok ? low.calculation : null,
      expected: c,
      high: high.ok ? high.calculation : null,
    },
  }
  console.log('\n── calculateAction 응답 전체 ──')
  console.log('총합                    ', kb(size(payload)))
  console.log('  calculation           ', kb(size(c)))
  console.log('  scenarios.low         ', kb(size(low.ok ? low.calculation : null)))
  console.log('  scenarios.expected    ', kb(size(c)), '← calculation과 같은 값')
  console.log('  scenarios.high        ', kb(size(high.ok ? high.calculation : null)))
})
