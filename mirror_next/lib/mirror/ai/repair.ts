import { z } from 'zod'
import { AIRawResponseSchema } from '../schema'
import type { PatternId, TimeOrientation, AgencyState, ToneStyle, SafetyTier } from '../types'
import {
  PatternIdSchema, TimeOrientationSchema, AgencyStateSchema,
  ToneStyleSchema, SafetyTierSchema,
} from '../schema'

export type RepairResult =
  | { ok: true;  data: z.infer<typeof AIRawResponseSchema>; repaired: boolean }
  | { ok: false; error: string }

// ─── JSON extraction ──────────────────────────────────────────────────────────

function extractJSON(raw: string): string | null {
  // Pass 1: clean and try
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/m, '')
    .replace(/^```\s*/m,    '')
    .replace(/\s*```$/m,    '')
    .trim()

  try { JSON.parse(cleaned); return cleaned } catch {}

  // Pass 2: extract first {...} block
  const m = cleaned.match(/\{[\s\S]*\}/)
  if (m) {
    try { JSON.parse(m[0]); return m[0] } catch {}
  }

  // Pass 3: structural repair
  let attempt = cleaned
  attempt = attempt.replace(/,\s*([}\]])/g, '$1')                          // trailing commas
  attempt = attempt.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // unquoted keys
  attempt = attempt.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"')           // single quotes

  const m2 = attempt.match(/\{[\s\S]*\}/)
  if (m2) {
    try { JSON.parse(m2[0]); return m2[0] } catch {}
  }

  return null
}

// ─── Field coercion ───────────────────────────────────────────────────────────

const VALID_PATTERNS = PatternIdSchema.options
const VALID_TIME     = TimeOrientationSchema.options
const VALID_AGENCY   = AgencyStateSchema.options
const VALID_TONE     = ToneStyleSchema.options
const VALID_SAFETY   = SafetyTierSchema.options

function coercePattern(v: unknown): PatternId {
  if (typeof v === 'string' && VALID_PATTERNS.includes(v as PatternId)) return v as PatternId
  return 'unresolved'
}

function coerceTime(v: unknown): TimeOrientation {
  if (typeof v === 'string' && VALID_TIME.includes(v as TimeOrientation)) return v as TimeOrientation
  return 'present'
}

function coerceAgency(v: unknown): AgencyState {
  if (typeof v === 'string' && VALID_AGENCY.includes(v as AgencyState)) return v as AgencyState
  return 'limited'
}

function coerceTone(v: unknown): ToneStyle {
  if (typeof v === 'string' && VALID_TONE.includes(v as ToneStyle)) return v as ToneStyle
  return 'clean'
}

function coerceSafety(v: unknown): SafetyTier {
  if (typeof v === 'string' && VALID_SAFETY.includes(v as SafetyTier)) return v as SafetyTier
  // Handle numeric 0/1/2 from older prompts
  if (v === 0 || v === '0') return 'green'
  if (v === 1 || v === '1') return 'amber'
  if (v === 2 || v === '2') return 'red'
  return 'green'
}

function coerceNumber(v: unknown, fallback: number, min = 0, max = 1): number {
  const n = Number(v)
  if (isNaN(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

function enforceWordLimit(text: string | undefined, max: number): string | undefined {
  if (!text) return undefined
  const words = text.trim().split(/\s+/).filter(Boolean)
  return words.length <= max ? text.trim() : words.slice(0, max).join(' ')
}

// ─── Repair entry point ───────────────────────────────────────────────────────

export function repairAIResponse(rawText: string): RepairResult {
  const extracted = extractJSON(rawText)
  if (!extracted) {
    return { ok: false, error: 'Could not extract JSON from model response' }
  }

  let parsed: unknown
  try { parsed = JSON.parse(extracted) }
  catch { return { ok: false, error: 'JSON parse failed after extraction' } }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Response was not an object' }
  }

  const raw = parsed as Record<string, unknown>
  const wasRaw = AIRawResponseSchema.safeParse(raw)
  const repaired = !wasRaw.success

  // Coerce all fields
  const coerced = {
    seen:              typeof raw.seen === 'string'             ? raw.seen.trim()    : undefined,
    distortion:        typeof raw.distortion === 'string'       ? raw.distortion.trim() : undefined,
    shift:             enforceWordLimit(raw.shift as string, 8),
    micro_practice:    enforceWordLimit(raw.micro_practice as string, 16),
    action_seed:       raw.action_seed != null
                         ? enforceWordLimit(String(raw.action_seed), 12)
                         : null,
    primary_pattern:   coercePattern(raw.primary_pattern),
    secondary_pattern: raw.secondary_pattern ? coercePattern(raw.secondary_pattern) : null,
    distortion_type:   typeof raw.distortion_type === 'string'
                         ? raw.distortion_type.slice(0, 60)
                         : 'unresolved',
    time_orientation:  coerceTime(raw.time_orientation),
    agency_state:      coerceAgency(raw.agency_state),
    body_location:     raw.body_location ? String(raw.body_location).slice(0, 40) : null,
    intensity_0_to_1:  coerceNumber(raw.intensity_0_to_1, 0.5),
    confidence_0_to_1: coerceNumber(raw.confidence_0_to_1, 0.6),
    tone_style:        coerceTone(raw.tone_style),
    safety_tier:       coerceSafety(raw.safety_tier),
  }

  // Minimum viability — need at least seen + shift
  if (!coerced.seen && !coerced.shift) {
    return { ok: false, error: 'Response missing both seen and shift — unusable' }
  }

  const result = AIRawResponseSchema.safeParse(coerced)
  if (!result.success) {
    // Return coerced anyway — validator in stateCompiler handles the rest
    return { ok: true, data: coerced as z.infer<typeof AIRawResponseSchema>, repaired: true }
  }

  return { ok: true, data: result.data, repaired }
}
