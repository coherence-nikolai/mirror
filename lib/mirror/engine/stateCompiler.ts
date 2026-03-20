import type { MirrorState, SafetyTier, SourceType, PatternId } from '../types'
import { VISUAL_PROFILES, BREATH_PROFILES, PATTERN_LIBRARY } from '../constants'
import type { ClassificationResult } from './classifier'

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

type CompileInput = {
  rawInput:        string
  classification:  ClassificationResult
  safetyTier:      SafetyTier
  source:          SourceType
  // Overrides from AI/repair — if present, take precedence over deterministic
  overrides?: {
    seen?:            string
    distortion?:      string
    distortionType?:  string
    shiftPhrase?:     string
    microPractice?:   string
    nextStep?:        string
    primaryPattern?:  PatternId
    secondaryPattern?:PatternId
    intensity?:       number
    confidence?:      number
    agencyState?:     import('../types').AgencyState
    toneStyle?:       import('../types').ToneStyle
    timeOrientation?: import('../types').TimeOrientation
    bodyLocation?:    string
  }
}

export function compileState(input: CompileInput): MirrorState {
  const { rawInput, classification, safetyTier, source, overrides } = input
  const { pattern, signals, timeOrientation, agencyState, confidence } = classification

  const patternId = (overrides?.primaryPattern ?? pattern?.id ?? 'unresolved') as PatternId
  const meta      = PATTERN_LIBRARY.find(p => p.id === patternId) ?? null

  // Intensity — AI override takes precedence, then computed
  const intensity = Math.min(1, Math.max(0,
    overrides?.intensity    ??
    classification.intensity ??
    meta?.baseIntensity     ?? 0.45
  ))
  // Boost intensity for elevated/red safety
  const safetyBoost  = safetyTier === 'red' ? 0.15 : safetyTier === 'amber' ? 0.08 : 0
  const finalIntensity = Math.min(1, intensity + safetyBoost)

  const finalConfidence = Math.min(1, Math.max(0,
    overrides?.confidence ?? confidence
  ))

  // Visual state — pattern-driven, then modulated by intensity and safety
  const baseVisual = { ...(VISUAL_PROFILES[patternId] ?? VISUAL_PROFILES.default) }
  const intensityMult = 0.6 + finalIntensity * 0.8
  baseVisual.glowStrength = Math.min(1, baseVisual.glowStrength * intensityMult)
  if (safetyTier === 'red') {
    // Crisis: calm the orb — slow, warm, steady
    baseVisual.pulseSpeed  = 9.0
    baseVisual.contraction = 0.25
    baseVisual.grain       = 0.15
  }

  const breathProfile = { ...(BREATH_PROFILES[patternId] ?? BREATH_PROFILES.default) }

  const state: MirrorState = {
    id:               uid(),
    rawInput,
    primaryPattern:   patternId,
    secondaryPattern: overrides?.primaryPattern ? overrides.secondaryPattern : (pattern?.secondary as PatternId | undefined),
    seen:             overrides?.seen ?? meta?.seen,
    distortionType:   overrides?.distortionType ?? meta?.distortionType ?? 'unresolved',
    distortion:       overrides?.distortion ?? meta?.distortionLine,
    intensity:        finalIntensity,
    confidence:       finalConfidence,
    timeOrientation:  overrides?.timeOrientation ?? classification.timeOrientation,
    agencyState:      overrides?.agencyState ?? agencyState,
    bodyLocation:     overrides?.bodyLocation ?? meta?.bodyLocation,
    toneStyle:        overrides?.toneStyle ?? 'clean',
    safetyTier,
    shiftPhrase:      overrides?.shiftPhrase ?? meta?.shiftPhrase ?? 'Return to what is here.',
    microPractice:    overrides?.microPractice ?? meta?.microPractice ?? 'One breath. Notice what is present.',
    nextStep:         overrides?.nextStep ?? meta?.nextStep,
    source,
    visualState:      baseVisual,
    breathProfile,
    helped:           null,
    saved:            false,
    createdAt:        new Date().toISOString(),
  }

  return state
}
