import { safetyScan }   from '@/lib/mirror/engine/safetyScan'
import { classify }     from '@/lib/mirror/engine/classifier'
import { compileState } from '@/lib/mirror/engine/stateCompiler'
import { EVAL_CASES }   from '@/lib/mirror/eval/evalCases'
import { scoreCase }    from '@/lib/mirror/eval/scoring'

describe('Eval harness — all cases', () => {
  EVAL_CASES.forEach(ec => {
    it(ec.label, () => {
      const safety = safetyScan(ec.input)
      const classification = classify(ec.input)
      const state = compileState({
        rawInput: ec.input,
        classification,
        safetyTier: safety.tier,
        source: 'deterministic',
      })
      const score = scoreCase(ec, state)

      if (!score.passed) {
        console.warn(`[FAIL] ${ec.label}`, {
          expected:  { pattern: ec.expectedPattern, safety: ec.expectedSafetyTier },
          got:       { pattern: state.primaryPattern, safety: state.safetyTier },
          shiftWords: score.shiftWordCount,
          microWords: score.microWordCount,
        })
      }

      expect(score.shiftWithinLimit).toBe(true)
      expect(score.microWithinLimit).toBe(true)
      expect(score.safetyCompliant).toBe(true)
    })
  })
})

describe('Eval harness — aggregate pass rate', () => {
  it('passes at least 80% of cases', () => {
    const results = EVAL_CASES.map(ec => {
      const safety = safetyScan(ec.input)
      const classification = classify(ec.input)
      const state = compileState({
        rawInput: ec.input,
        classification,
        safetyTier: safety.tier,
        source: 'deterministic',
      })
      return scoreCase(ec, state)
    })
    const passed = results.filter(r => r.passed).length
    const rate   = passed / results.length
    console.info(`Eval pass rate: ${passed}/${results.length} (${Math.round(rate * 100)}%)`)
    expect(rate).toBeGreaterThanOrEqual(0.80)
  })
})
