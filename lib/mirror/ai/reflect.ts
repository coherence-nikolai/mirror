import { buildSystemPrompt } from './promptBuilder'
import { callModel }         from './provider'
import { repairAIResponse }  from './repair'
import type { ClassificationResult } from '../engine/classifier'
import type { SafetyTier, ToneStyle, PatternId } from '../types'
import type { z } from 'zod'
import type { AIRawResponseSchema } from '../schema'

type AIReflectInput = {
  rawInput:          string
  classification:    ClassificationResult
  safetyTier:        SafetyTier
  tonePreference?:   ToneStyle
  effectivePhrases?: string[]
  recurringPatterns?: PatternId[]
}

type AIReflectResult =
  | { ok: true;  data: z.infer<typeof AIRawResponseSchema>; repaired: boolean }
  | { ok: false; error: string }

export async function aiReflect(input: AIReflectInput): Promise<AIReflectResult> {
  const system = buildSystemPrompt({
    rawInput:         input.rawInput,
    classification:   input.classification,
    safetyTier:       input.safetyTier,
    tonePreference:   input.tonePreference,
    effectivePhrases: input.effectivePhrases,
    recurringPatterns:input.recurringPatterns,
  })

  const callResult = await callModel(system, input.rawInput)
  if (!callResult.ok) {
    return { ok: false, error: callResult.error }
  }

  const repaired = repairAIResponse(callResult.text)
  return repaired
}
