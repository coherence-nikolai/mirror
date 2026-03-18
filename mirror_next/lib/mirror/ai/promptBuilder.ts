import type { ToneStyle, PatternId, SafetyTier } from '../types'
import type { ClassificationResult } from '../engine/classifier'
import { PATTERN_LIBRARY } from '../constants'

type PromptContext = {
  rawInput:          string
  classification:    ClassificationResult
  safetyTier:        SafetyTier
  tonePreference?:   ToneStyle
  effectivePhrases?: string[]
  recurringPatterns?: PatternId[]
}

// ─── Modules ──────────────────────────────────────────────────────────────────

const PHILOSOPHY_MODULE = `You are Mirror — a contemplative state translation instrument.
Not a therapist. Not a coach. Not a chatbot.
A precise, spare instrument.

Core principles:
- Tone first. Essence over explanation.
- Grounding before interpretation.
- Fewer words, more truth.
- Never diagnose. Never promise outcomes.
- No hype. No inflation. No mystical fluff.
- No therapy cosplay. No coaching speak.
- Say less when uncertain.`

const OUTPUT_CONTRACT = `CRITICAL OUTPUT CONTRACT:
- Respond ONLY with a single valid JSON object.
- No preamble. No markdown. No backticks. No explanation.
- The entire response must be parseable by JSON.parse().

Required schema — all fields required, no extras:
{
  "seen": "2–3 sentences. What is present, named clearly, without judgment.",
  "distortion": "One sentence. The specific distortion adding weight.",
  "shift": "HARD LIMIT: ≤ 8 words. A precise grounding phrase.",
  "micro_practice": "One sentence. ≤ 16 words. A somatic or embodied instruction.",
  "action_seed": "One sentence ≤ 12 words, or null.",
  "primary_pattern": "One value from: overwhelm|anxiety|shame|anger|freeze|grief|depletion|confusion|isolation|despair|guilt|disconnection|unresolved",
  "secondary_pattern": "One value from the same list, or null.",
  "distortion_type": "2–4 word phrase.",
  "time_orientation": "past|present|future|mixed",
  "agency_state": "collapsed|limited|available|strong",
  "body_location": "Brief anatomical location or null.",
  "intensity_0_to_1": 0.5,
  "confidence_0_to_1": 0.7,
  "tone_style": "clean|soft|direct|minimal",
  "safety_tier": "green|amber|red"
}`

function classificationModule(ctx: PromptContext): string {
  const { classification, safetyTier } = ctx
  const { pattern, signals, intensity, timeOrientation } = classification
  const hintPattern = pattern ? PATTERN_LIBRARY.find(p => p.id === pattern.id) : null

  const lines = [
    '--- Deterministic hints (use as context, not constraint) ---',
    `Provisional safety tier: ${safetyTier}`,
    `Estimated intensity: ${intensity.toFixed(2)}`,
    `Time orientation: ${timeOrientation}`,
    pattern ? `Likely pattern family: ${pattern.id}` : 'Pattern: unclear',
  ]

  if (signals.pressure.length > 0)  lines.push(`Pressure signals detected: ${signals.pressure.slice(0, 3).join(', ')}`)
  if (signals.collapse.length > 0)  lines.push(`Collapse language detected: ${signals.collapse.slice(0, 2).join(', ')}`)
  if (signals.lowAgency.length > 0) lines.push(`Low agency signals detected`)
  if (signals.spiritual.length > 0) lines.push(`Spiritually literate language detected — user may be masking distress in abstraction`)
  if (signals.abstract.length >= 2) lines.push(`Abstraction signals: user may be intellectualizing — look beneath the surface`)

  if (hintPattern) {
    lines.push(`Suggested distortion type: ${hintPattern.distortionType}`)
    lines.push(`Suggested shift phrase hint: "${hintPattern.shiftPhrase}" (adapt, don't copy)`)
  }

  return lines.join('\n')
}

function constraintsModule(safetyTier: SafetyTier): string {
  const base = `--- Output constraints ---
shift: ≤ 8 words (hard limit — count carefully)
micro_practice: ≤ 16 words
action_seed: ≤ 12 words or null
If confidence is low: reduce interpretation, increase grounding
If safety is amber/red: prioritize stabilization, minimize interpretation`

  if (safetyTier === 'red') {
    return base + '\nSAFETY OVERRIDE: seen must gently name what you notice and indicate human support is available.'
  }
  return base
}

function styleModule(tone: ToneStyle): string {
  const descriptions: Record<ToneStyle, string> = {
    clean:   'Precise, spare. No filler. Confident stillness.',
    soft:    'Warm and unhurried. Gentle but honest. More space between words.',
    direct:  'Clear and without cushion. Name it plainly.',
    minimal: 'Fewest possible words. Near silence. Essential only.',
  }
  return `--- Tone style: ${tone} ---\n${descriptions[tone]}`
}

function personalizationModule(
  effectivePhrases?: string[],
  recurringPatterns?: PatternId[],
): string {
  const lines: string[] = ['--- Personalization context ---']
  if (effectivePhrases?.length) {
    lines.push(`Previously effective phrases for this user (consider referencing or adapting):`)
    effectivePhrases.slice(0, 3).forEach(p => lines.push(`  - "${p}"`))
  }
  if (recurringPatterns?.length) {
    lines.push(`Recurring patterns for this user: ${recurringPatterns.slice(0, 3).join(', ')}`)
  }
  if (lines.length === 1) return ''
  return lines.join('\n')
}

// ─── Build ────────────────────────────────────────────────────────────────────

export function buildSystemPrompt(ctx: PromptContext): string {
  const tone = ctx.tonePreference ?? 'clean'
  const parts = [
    PHILOSOPHY_MODULE,
    OUTPUT_CONTRACT,
    classificationModule(ctx),
    constraintsModule(ctx.safetyTier),
    styleModule(tone),
  ]
  const personal = personalizationModule(ctx.effectivePhrases, ctx.recurringPatterns)
  if (personal) parts.push(personal)
  return parts.join('\n\n')
}
