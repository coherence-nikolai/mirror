// ─── Enumerations ───────────────────────────────────────────────────────────

export type SafetyTier = 'green' | 'amber' | 'red'
export type TimeOrientation = 'past' | 'present' | 'future' | 'mixed'
export type AgencyState = 'collapsed' | 'limited' | 'available' | 'strong'
export type ToneStyle = 'clean' | 'soft' | 'direct' | 'minimal'
export type SourceType = 'deterministic' | 'ai' | 'hybrid' | 'repaired'

export type PatternId =
  | 'overwhelm' | 'anxiety' | 'shame' | 'anger' | 'freeze'
  | 'grief' | 'depletion' | 'confusion' | 'isolation' | 'despair'
  | 'guilt' | 'disconnection'
  | 'unsettled' | 'unclear' | 'mixed' | 'tender' | 'threshold'
  | 'unresolved'

// ─── Visual + Breath ─────────────────────────────────────────────────────────

export type MirrorVisualState = {
  pulseSpeed: number    // seconds, 2–12
  pulseDepth: number    // 0–1, scale amplitude
  glowStrength: number  // 0–1
  contraction: number   // 0–1, inward pull (1 = most contracted)
  grain: number         // 0–1
  blur: number          // 0–1
}

export type MirrorBreathProfile = {
  inhale: number   // ms
  holdIn: number   // ms
  exhale: number   // ms
  holdOut: number  // ms
}

// ─── Canonical MirrorState ───────────────────────────────────────────────────

export type MirrorState = {
  id: string
  rawInput: string
  primaryPattern: PatternId
  secondaryPattern?: PatternId
  distortionType: string       // 2–4 word label
  seen?: string                // what is present (AI path)
  distortion?: string          // full sentence (AI path)
  intensity: number            // 0–1
  confidence: number           // 0–1
  timeOrientation: TimeOrientation
  agencyState: AgencyState
  bodyLocation?: string
  toneStyle: ToneStyle
  safetyTier: SafetyTier
  shiftPhrase: string          // ≤ 8 words
  microPractice: string        // ≤ 16 words
  nextStep?: string            // ≤ 12 words
  source: SourceType
  visualState: MirrorVisualState
  breathProfile: MirrorBreathProfile
  helped?: boolean | null
  saved?: boolean
  createdAt: string            // ISO 8601
}

// ─── API types ───────────────────────────────────────────────────────────────

export type ReflectRequest = {
  rawInput: string
  tonePreference?: ToneStyle
  useAI?: boolean
  hints?: {
    safetyTier?: SafetyTier
    primaryPattern?: PatternId
    intensity?: number
  }
}

export type ReflectResponse =
  | { ok: true;  state: MirrorState; repaired: boolean }
  | { ok: false; error: string; fallback?: MirrorState }

export type FeedbackRequest = {
  id: string
  helped: boolean
}

// ─── Storage types ───────────────────────────────────────────────────────────

export type StoredReflection = MirrorState & {
  helped: boolean | null
  saved: boolean
}

export type PatternFrequency = Record<string, number>

export type PhraseRecord = {
  phrase: string
  pattern: PatternId
  helpedCount: number
  usedCount: number
  lastUsed: string
}

export type ToneProfile = {
  preferred: ToneStyle
  history: Array<{ tone: ToneStyle; helped: boolean }>
}

// ─── Eval types ──────────────────────────────────────────────────────────────

export type EvalCase = {
  id: string
  label: string
  input: string
  expectedPattern: PatternId
  expectedSafetyTier: SafetyTier
  expectedTimeOrientation?: TimeOrientation
}

export type EvalScore = {
  caseId: string
  patternMatch: boolean
  safetyMatch: boolean
  shiftWordCount: number
  shiftWithinLimit: boolean
  microWordCount: number
  microWithinLimit: boolean
  safetyCompliant: boolean
  passed: boolean
}
