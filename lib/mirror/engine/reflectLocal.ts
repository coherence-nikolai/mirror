import type { MirrorState, ToneStyle, PatternId } from '../types'
import { safetyScan } from './safetyScan'
import { classify } from './classifier'
import { compileState } from './stateCompiler'

type LocalReflectInput = {
  rawInput: string
  tonePreference?: ToneStyle
  hints?: {
    safetyTier?: 'green' | 'amber' | 'red'
    primaryPattern?: PatternId
    intensity?: number
  }
}

export function reflectLocal(input: LocalReflectInput): MirrorState {
  const safety = safetyScan(input.rawInput)
  const classification = classify(input.rawInput)

  if (input.hints?.intensity != null) {
    classification.intensity = Math.max(classification.intensity, input.hints.intensity)
  }

  const tierOrder = { green: 0, amber: 1, red: 2 } as const
  const safetyTier = input.hints?.safetyTier && tierOrder[input.hints.safetyTier] > tierOrder[safety.tier]
    ? input.hints.safetyTier
    : safety.tier

  return compileState({
    rawInput: input.rawInput,
    classification,
    safetyTier,
    source: 'deterministic',
    overrides: {
      primaryPattern: input.hints?.primaryPattern,
      toneStyle: input.tonePreference,
    },
  })
}
