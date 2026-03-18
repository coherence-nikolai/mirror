import { safetyScan }   from '@/lib/mirror/engine/safetyScan'
import { classify }     from '@/lib/mirror/engine/classifier'
import { compileState } from '@/lib/mirror/engine/stateCompiler'
import { MirrorStateSchema } from '@/lib/mirror/schema'

function runPipeline(input: string) {
  const safety = safetyScan(input)
  const classification = classify(input)
  const state = compileState({
    rawInput: input,
    classification,
    safetyTier: safety.tier,
    source: 'deterministic',
  })
  return { safety, classification, state }
}

describe('Pipeline — deterministic path produces valid MirrorState', () => {
  const cases = [
    'I am completely overwhelmed. Everything is too much.',
    'I feel ashamed and worthless.',
    "I can't start. I'm frozen.",
    'I am exhausted and drained.',
    'I feel numb and disconnected.',
    'I miss them. The grief is immense.',
    'What is the point of anything? Nothing matters.',
    'I am so lonely and invisible.',
    'I feel guilty about what I did.',
  ]

  cases.forEach(input => {
    it(`validates output for: "${input.slice(0, 40)}…"`, () => {
      const { state } = runPipeline(input)
      const result = MirrorStateSchema.safeParse(state)
      if (!result.success) {
        console.error(result.error.issues)
      }
      expect(result.success).toBe(true)
    })
  })
})

describe('Pipeline — safety routing', () => {
  it('routes crisis input to red tier', () => {
    const { safety, state } = runPipeline('I want to kill myself.')
    expect(safety.tier).toBe('red')
    expect(state.safetyTier).toBe('red')
  })

  it('routes elevated input to amber tier', () => {
    const { state } = runPipeline("I can't cope anymore. I'm at rock bottom.")
    expect(state.safetyTier).toBe('amber')
  })

  it('returns green for neutral input', () => {
    const { state } = runPipeline('I feel a little stuck today.')
    expect(state.safetyTier).toBe('green')
  })
})

describe('Pipeline — word count constraints', () => {
  it('shift phrase never exceeds 8 words', () => {
    const inputs = [
      'Everything is too much.',
      'I feel hopeless and lost.',
      'I cannot start anything today.',
    ]
    inputs.forEach(input => {
      const { state } = runPipeline(input)
      const words = state.shiftPhrase.trim().split(/\s+/).filter(Boolean).length
      expect(words).toBeLessThanOrEqual(8)
    })
  })

  it('microPractice never exceeds 16 words', () => {
    const { state } = runPipeline('I am overwhelmed.')
    const words = state.microPractice.trim().split(/\s+/).filter(Boolean).length
    expect(words).toBeLessThanOrEqual(16)
  })
})

describe('Pipeline — fallback for unknown input', () => {
  it('returns unresolved pattern for empty signal', () => {
    const { state } = runPipeline('hi')
    expect(state.primaryPattern).toBe('unresolved')
    expect(state.confidence).toBeLessThan(0.5)
  })
})
