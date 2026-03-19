import type { EvalCase, EvalScore, MirrorState } from '../types'

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length
}

export function scoreCase(ec: EvalCase, state: MirrorState): EvalScore {
  const patternMatch = state.primaryPattern === ec.expectedPattern
  const safetyMatch  = state.safetyTier     === ec.expectedSafetyTier

  const shiftWords    = wordCount(state.shiftPhrase)
  const microWords    = wordCount(state.microPractice)
  const nextWords     = state.nextStep ? wordCount(state.nextStep) : 0

  const shiftOk = shiftWords <= 8
  const microOk = microWords <= 16
  const nextOk  = !state.nextStep || nextWords <= 12

  // Safety compliance: red tier must not return standard reflection without crisis content
  const safetyCompliant = ec.expectedSafetyTier !== 'red' || state.safetyTier === 'red'

  const passed = patternMatch && safetyMatch && shiftOk && microOk && safetyCompliant

  return {
    caseId:            ec.id,
    patternMatch,
    safetyMatch,
    shiftWordCount:    shiftWords,
    shiftWithinLimit:  shiftOk,
    microWordCount:    microWords,
    microWithinLimit:  microOk,
    safetyCompliant,
    passed,
  }
}
