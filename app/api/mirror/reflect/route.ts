import { NextRequest, NextResponse } from 'next/server'
import { ReflectRequestSchema, MirrorStateSchema, AIRawResponseSchema } from '@/lib/mirror/schema'
import { safetyScan } from '@/lib/mirror/engine/safetyScan'
import { classify } from '@/lib/mirror/engine/classifier'
import { compileState } from '@/lib/mirror/engine/stateCompiler'
import { aiReflect } from '@/lib/mirror/ai/reflect'
import type { MirrorState, SourceType, PatternId, AgencyState, ToneStyle, TimeOrientation, SafetyTier } from '@/lib/mirror/types'
import type { z } from 'zod'

type AIRawResponse = z.infer<typeof AIRawResponseSchema>

type ReflectResponse =
  | { ok: true; state: MirrorState; repaired: boolean }
  | { ok: false; error: string; fallback?: MirrorState }

export async function POST(req: NextRequest): Promise<NextResponse<ReflectResponse>> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ReflectRequestSchema.safeParse(body)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue: { message: string }) => issue.message).join('; ')
    return NextResponse.json({ ok: false, error: `Invalid request: ${issues}` }, { status: 400 })
  }

  const { rawInput, tonePreference, useAI = true, hints } = parsed.data

  const safety = safetyScan(rawInput)
  const tierOrder = { green: 0, amber: 1, red: 2 } as const
  const rank = (tier: SafetyTier) => tierOrder[tier]
  const hintTier = hints?.safetyTier
  const safetyTier = hintTier && rank(hintTier) > rank(safety.tier) ? hintTier : safety.tier

  const classification = classify(rawInput)
  if (hints?.intensity != null) {
    classification.intensity = Math.max(classification.intensity, hints.intensity)
  }

  const shouldUseAI = useAI && Boolean(process.env.ANTHROPIC_API_KEY)

  let source: SourceType = 'deterministic'
  let aiData: AIRawResponse | null = null
  let repaired = false

  if (shouldUseAI) {
    const aiResult = await aiReflect({
      rawInput,
      classification,
      safetyTier,
      tonePreference,
    })

    if (aiResult.ok) {
      aiData = aiResult.data
      repaired = aiResult.repaired
      source = repaired ? 'repaired' : 'ai'
    }
  }

  const aiSafetyTier = aiData?.safety_tier as SafetyTier | undefined
  const finalSafetyTier: SafetyTier = aiSafetyTier && rank(aiSafetyTier) > rank(safetyTier)
    ? aiSafetyTier
    : safetyTier

  const state = compileState({
    rawInput,
    classification,
    safetyTier: finalSafetyTier,
    source,
    overrides: aiData ? {
      seen: aiData.seen,
      distortion: aiData.distortion,
      distortionType: aiData.distortion_type,
      shiftPhrase: aiData.shift,
      microPractice: aiData.micro_practice,
      nextStep: aiData.action_seed ?? undefined,
      primaryPattern: aiData.primary_pattern as PatternId,
      secondaryPattern: aiData.secondary_pattern as PatternId | undefined,
      intensity: aiData.intensity_0_to_1 as number | undefined,
      confidence: aiData.confidence_0_to_1 as number | undefined,
      agencyState: aiData.agency_state as AgencyState | undefined,
      toneStyle: (tonePreference ?? aiData.tone_style) as ToneStyle | undefined,
      bodyLocation: aiData.body_location ?? undefined,
      timeOrientation: aiData.time_orientation as TimeOrientation | undefined,
    } : {
      toneStyle: tonePreference,
      primaryPattern: hints?.primaryPattern,
    },
  })

  const validation = MirrorStateSchema.safeParse(state)
  if (!validation.success) {
    const fallback = compileState({
      rawInput,
      classification,
      safetyTier,
      source: 'deterministic',
      overrides: { toneStyle: tonePreference },
    })
    return NextResponse.json({
      ok: false,
      error: 'State validation failed — returning deterministic fallback',
      fallback,
    })
  }

  return NextResponse.json({ ok: true, state: validation.data, repaired })
}
