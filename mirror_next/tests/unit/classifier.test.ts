import { classify } from '@/lib/mirror/engine/classifier'

describe('classify — keyword matching', () => {
  it('detects overwhelm', () => {
    const r = classify('Everything is too much. I am completely overwhelmed.')
    expect(r.pattern?.id).toBe('overwhelm')
    expect(r.confidence).toBeGreaterThan(0.5)
  })

  it('detects anxiety', () => {
    const r = classify('I am so anxious about what might happen.')
    expect(r.pattern?.id).toBe('anxiety')
  })

  it('detects grief', () => {
    const r = classify('I miss them so much. The grief is unbearable.')
    expect(r.pattern?.id).toBe('grief')
    expect(r.timeOrientation).toBe('past')
  })

  it('detects freeze', () => {
    const r = classify("I can't start anything. I'm completely frozen.")
    expect(r.pattern?.id).toBe('freeze')
  })

  it('detects shame', () => {
    const r = classify('I think there is something fundamentally wrong with me. I keep failing.')
    expect(r.pattern?.id).toBe('shame')
  })

  it('detects depletion', () => {
    const r = classify('I am completely exhausted and drained. Nothing left.')
    expect(r.pattern?.id).toBe('depletion')
  })

  it('returns unresolved for unclear input with low confidence', () => {
    const r = classify('hi')
    expect(r.confidence).toBeLessThan(0.5)
  })
})

describe('classify — time orientation', () => {
  it('detects past orientation from leakage', () => {
    const r = classify('I should have done that differently. I keep replaying what happened.')
    expect(r.timeOrientation).toBe('past')
  })

  it('detects future orientation', () => {
    const r = classify("What if I fail? What if it all falls apart? I'll never recover.")
    expect(r.timeOrientation).toBe('future')
  })
})

describe('classify — intensity', () => {
  it('boosts intensity with pressure signals', () => {
    const base   = classify('I feel anxious.')
    const boosted = classify('I am always anxious, every time, all the time, constantly, it never stops.')
    expect(boosted.intensity).toBeGreaterThan(base.intensity)
  })

  it('boosts intensity with collapse signals', () => {
    const r = classify('I am falling apart. Everything is crumbling. I am on the edge.')
    expect(r.intensity).toBeGreaterThan(0.7)
  })
})
