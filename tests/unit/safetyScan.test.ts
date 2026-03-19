import { safetyScan } from '@/lib/mirror/engine/safetyScan'

describe('safetyScan', () => {
  it('returns green for neutral input', () => {
    const r = safetyScan('I feel a bit tired today.')
    expect(r.tier).toBe('green')
    expect(r.shouldReturnMode).toBe(false)
  })

  it('returns red for crisis language', () => {
    const r = safetyScan('I want to kill myself.')
    expect(r.tier).toBe('red')
    expect(r.shouldReturnMode).toBe(true)
    expect(r.triggered).toBeTruthy()
  })

  it('returns amber for elevated language', () => {
    const r = safetyScan("I can't cope anymore. I'm completely falling apart.")
    expect(r.tier).toBe('amber')
    expect(r.shouldReturnMode).toBe(true)
  })

  it('returns amber for spiral language', () => {
    const r = safetyScan("I'm spiraling and can't stop.")
    expect(r.tier).toBe('amber')
    expect(r.shouldReturnMode).toBe(true)
  })

  it('is case insensitive', () => {
    const r = safetyScan('WANT TO DIE')
    expect(r.tier).toBe('red')
  })
})
