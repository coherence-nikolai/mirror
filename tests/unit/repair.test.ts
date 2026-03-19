import { repairAIResponse } from '@/lib/mirror/ai/repair'

describe('repairAIResponse — JSON extraction', () => {
  it('parses clean JSON', () => {
    const raw = JSON.stringify({
      seen: 'Something is present.',
      distortion: 'Future is being cast as fact.',
      shift: 'This moment is survivable.',
      micro_practice: 'Slow the exhale.',
      action_seed: null,
      primary_pattern: 'anxiety',
      secondary_pattern: null,
      distortion_type: 'future-casting',
      time_orientation: 'future',
      agency_state: 'limited',
      body_location: 'chest',
      intensity_0_to_1: 0.6,
      confidence_0_to_1: 0.8,
      tone_style: 'clean',
      safety_tier: 'green',
    })
    const r = repairAIResponse(raw)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.repaired).toBe(false)
  })

  it('extracts JSON wrapped in markdown fences', () => {
    const raw = '```json\n{"seen":"test","shift":"one two three","micro_practice":"breathe","primary_pattern":"anxiety","distortion_type":"test","time_orientation":"present","agency_state":"limited","intensity_0_to_1":0.5,"confidence_0_to_1":0.6,"tone_style":"clean","safety_tier":"green"}\n```'
    const r = repairAIResponse(raw)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.repaired).toBe(true)
  })

  it('extracts JSON after preamble text', () => {
    const raw = 'Here is the reflection: {"seen":"test","shift":"one two","micro_practice":"breathe","primary_pattern":"grief","distortion_type":"absence","time_orientation":"past","agency_state":"limited","intensity_0_to_1":0.5,"confidence_0_to_1":0.6,"tone_style":"soft","safety_tier":"green"}'
    const r = repairAIResponse(raw)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.repaired).toBe(true)
  })

  it('returns ok:false for completely unrecoverable input', () => {
    const r = repairAIResponse('this is not json at all nothing here')
    expect(r.ok).toBe(false)
  })

  it('enforces shift word limit during coercion', () => {
    const raw = JSON.stringify({
      seen: 'Something.',
      distortion: 'It is.',
      shift: 'one two three four five six seven eight nine ten',
      micro_practice: 'breathe slowly',
      primary_pattern: 'anxiety',
      distortion_type: 'future-casting',
      time_orientation: 'future',
      agency_state: 'limited',
      intensity_0_to_1: 0.5,
      confidence_0_to_1: 0.6,
      tone_style: 'clean',
      safety_tier: 'green',
    })
    const r = repairAIResponse(raw)
    expect(r.ok).toBe(true)
    if (r.ok) {
      const words = (r.data.shift ?? '').trim().split(/\s+/).length
      expect(words).toBeLessThanOrEqual(8)
    }
  })

  it('coerces numeric safety tier to string', () => {
    const raw = JSON.stringify({
      seen: 'Test.', distortion: 'Test.', shift: 'one two three',
      micro_practice: 'breathe', primary_pattern: 'grief',
      distortion_type: 'test', time_orientation: 'past',
      agency_state: 'limited', intensity_0_to_1: 0.5,
      confidence_0_to_1: 0.6, tone_style: 'soft', safety_tier: 0,
    })
    const r = repairAIResponse(raw)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data.safety_tier).toBe('green')
  })
})
