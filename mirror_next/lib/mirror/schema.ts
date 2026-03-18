import { z } from 'zod'

// ─── Enum schemas ─────────────────────────────────────────────────────────────

export const SafetyTierSchema = z.enum(['green', 'amber', 'red'])
export const TimeOrientationSchema = z.enum(['past', 'present', 'future', 'mixed'])
export const AgencyStateSchema = z.enum(['collapsed', 'limited', 'available', 'strong'])
export const ToneStyleSchema = z.enum(['clean', 'soft', 'direct', 'minimal'])
export const SourceTypeSchema = z.enum(['deterministic', 'ai', 'hybrid', 'repaired'])

export const PatternIdSchema = z.enum([
  'overwhelm', 'anxiety', 'shame', 'anger', 'freeze',
  'grief', 'depletion', 'confusion', 'isolation', 'despair',
  'guilt', 'disconnection', 'unresolved',
])

// ─── Visual + Breath schemas ──────────────────────────────────────────────────

export const MirrorVisualStateSchema = z.object({
  pulseSpeed:  z.number().min(2).max(12),
  pulseDepth:  z.number().min(0).max(1),
  glowStrength:z.number().min(0).max(1),
  contraction: z.number().min(0).max(1),
  grain:       z.number().min(0).max(1),
  blur:        z.number().min(0).max(1),
})

export const MirrorBreathProfileSchema = z.object({
  inhale:  z.number().int().positive(),
  holdIn:  z.number().int().min(0),
  exhale:  z.number().int().positive(),
  holdOut: z.number().int().min(0),
})

// ─── Word-count refinements ───────────────────────────────────────────────────

const maxWords = (max: number) => (val: string) =>
  val.trim().split(/\s+/).filter(Boolean).length <= max

export const ShiftPhraseSchema = z
  .string()
  .min(1)
  .refine(maxWords(8), { message: 'shiftPhrase must be ≤ 8 words' })

export const MicroPracticeSchema = z
  .string()
  .min(1)
  .refine(maxWords(16), { message: 'microPractice must be ≤ 16 words' })

export const NextStepSchema = z
  .string()
  .refine(maxWords(12), { message: 'nextStep must be ≤ 12 words' })

// ─── Canonical MirrorState schema ────────────────────────────────────────────

export const MirrorStateSchema = z.object({
  id:               z.string().min(1),
  rawInput:         z.string().min(1),
  primaryPattern:   PatternIdSchema,
  secondaryPattern: PatternIdSchema.optional(),
  distortionType:   z.string().min(1).max(60),
  seen:             z.string().optional(),
  distortion:       z.string().optional(),
  intensity:        z.number().min(0).max(1),
  confidence:       z.number().min(0).max(1),
  timeOrientation:  TimeOrientationSchema,
  agencyState:      AgencyStateSchema,
  bodyLocation:     z.string().max(40).optional(),
  toneStyle:        ToneStyleSchema,
  safetyTier:       SafetyTierSchema,
  shiftPhrase:      ShiftPhraseSchema,
  microPractice:    MicroPracticeSchema,
  nextStep:         NextStepSchema.optional(),
  source:           SourceTypeSchema,
  visualState:      MirrorVisualStateSchema,
  breathProfile:    MirrorBreathProfileSchema,
  helped:           z.boolean().nullable().optional(),
  saved:            z.boolean().optional(),
  createdAt:        z.string().datetime(),
})

export type MirrorStateInput = z.input<typeof MirrorStateSchema>

// ─── Request / Response schemas ───────────────────────────────────────────────

export const ReflectRequestSchema = z.object({
  rawInput:        z.string().min(1).max(2000),
  tonePreference:  ToneStyleSchema.optional(),
  useAI:           z.boolean().optional(),
  hints: z.object({
    safetyTier:      SafetyTierSchema.optional(),
    primaryPattern:  PatternIdSchema.optional(),
    intensity:       z.number().min(0).max(1).optional(),
  }).optional(),
})

export const FeedbackRequestSchema = z.object({
  id:     z.string().min(1),
  helped: z.boolean(),
})

// ─── AI raw response schema (permissive — repair handles the rest) ────────────

export const AIRawResponseSchema = z.object({
  seen:              z.string().optional(),
  distortion:        z.string().optional(),
  shift:             z.string().optional(),
  micro_practice:    z.string().optional(),
  action_seed:       z.string().nullable().optional(),
  primary_pattern:   z.string().optional(),
  secondary_pattern: z.string().nullable().optional(),
  distortion_type:   z.string().optional(),
  time_orientation:  z.string().optional(),
  agency_state:      z.string().optional(),
  body_location:     z.string().nullable().optional(),
  intensity_0_to_1:  z.union([z.number(), z.string()]).optional(),
  confidence_0_to_1: z.union([z.number(), z.string()]).optional(),
  tone_style:        z.string().optional(),
  safety_tier:       z.union([z.string(), z.number()]).optional(),
}).passthrough()
