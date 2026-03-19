import { MirrorStateSchema, ShiftPhraseSchema, MicroPracticeSchema, NextStepSchema } from '@/lib/mirror/schema'

describe('ShiftPhraseSchema — 8-word hard limit', () => {
  it('accepts 8 words', () => {
    expect(ShiftPhraseSchema.safeParse('Only this breath only this right now.').success).toBe(true)
  })

  it('accepts fewer than 8 words', () => {
    expect(ShiftPhraseSchema.safeParse('Only this breath.').success).toBe(true)
  })

  it('rejects 9 words', () => {
    expect(ShiftPhraseSchema.safeParse('Only this breath only this right now here.').success).toBe(false)
  })
})

describe('MicroPracticeSchema — 16-word limit', () => {
  it('accepts 16 words', () => {
    const phrase = 'Feel both feet on the ground and name three things you can physically touch right now.'
    const words  = phrase.split(' ').length
    expect(words).toBeLessThanOrEqual(16)
    expect(MicroPracticeSchema.safeParse(phrase).success).toBe(true)
  })

  it('rejects over 16 words', () => {
    const long = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen'
    expect(MicroPracticeSchema.safeParse(long).success).toBe(false)
  })
})

describe('NextStepSchema — 12-word limit', () => {
  it('rejects over 12 words', () => {
    const long = 'one two three four five six seven eight nine ten eleven twelve thirteen'
    expect(NextStepSchema.safeParse(long).success).toBe(false)
  })
})

describe('MirrorStateSchema', () => {
  const valid = {
    id: 'abc123',
    rawInput: 'I feel overwhelmed.',
    primaryPattern: 'overwhelm',
    distortionType: 'magnitude conflation',
    intensity: 0.7,
    confidence: 0.85,
    timeOrientation: 'present',
    agencyState: 'limited',
    toneStyle: 'clean',
    safetyTier: 'green',
    shiftPhrase: 'Only this breath. Only this.',
    microPractice: 'Feel both feet. Name three things you can touch.',
    source: 'deterministic',
    visualState: { pulseSpeed: 5.5, pulseDepth: 0.05, glowStrength: 0.30, contraction: 0.35, grain: 0.30, blur: 0.20 },
    breathProfile: { inhale: 4000, holdIn: 1000, exhale: 5000, holdOut: 1000 },
    createdAt: new Date().toISOString(),
  }

  it('accepts a valid state', () => {
    expect(MirrorStateSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects unknown safetyTier', () => {
    expect(MirrorStateSchema.safeParse({ ...valid, safetyTier: 'yellow' }).success).toBe(false)
  })

  it('rejects unknown primaryPattern', () => {
    expect(MirrorStateSchema.safeParse({ ...valid, primaryPattern: 'sadness' }).success).toBe(false)
  })

  it('rejects intensity > 1', () => {
    expect(MirrorStateSchema.safeParse({ ...valid, intensity: 1.5 }).success).toBe(false)
  })

  it('rejects shift over 8 words', () => {
    const long = 'one two three four five six seven eight nine'
    expect(MirrorStateSchema.safeParse({ ...valid, shiftPhrase: long }).success).toBe(false)
  })
})
