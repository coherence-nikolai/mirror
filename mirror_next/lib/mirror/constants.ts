import type {
  PatternId, MirrorVisualState, MirrorBreathProfile,
  SafetyTier, TimeOrientation, AgencyState, ToneStyle,
} from './types'

// ─── Visual profiles ──────────────────────────────────────────────────────────

export const VISUAL_PROFILES: Record<PatternId | 'default', MirrorVisualState> = {
  overwhelm:     { pulseSpeed: 2.8, pulseDepth: 0.08, glowStrength: 0.55, contraction: 0.75, grain: 0.55, blur: 0.20 },
  anxiety:       { pulseSpeed: 3.2, pulseDepth: 0.07, glowStrength: 0.45, contraction: 0.65, grain: 0.50, blur: 0.15 },
  shame:         { pulseSpeed: 6.5, pulseDepth: 0.05, glowStrength: 0.28, contraction: 0.80, grain: 0.35, blur: 0.30 },
  anger:         { pulseSpeed: 2.4, pulseDepth: 0.10, glowStrength: 0.60, contraction: 0.60, grain: 0.60, blur: 0.10 },
  freeze:        { pulseSpeed: 7.0, pulseDepth: 0.04, glowStrength: 0.30, contraction: 0.70, grain: 0.40, blur: 0.20 },
  grief:         { pulseSpeed: 8.5, pulseDepth: 0.06, glowStrength: 0.35, contraction: 0.30, grain: 0.25, blur: 0.35 },
  depletion:     { pulseSpeed:10.0, pulseDepth: 0.04, glowStrength: 0.25, contraction: 0.25, grain: 0.20, blur: 0.30 },
  confusion:     { pulseSpeed: 5.5, pulseDepth: 0.06, glowStrength: 0.38, contraction: 0.45, grain: 0.45, blur: 0.25 },
  isolation:     { pulseSpeed: 7.5, pulseDepth: 0.05, glowStrength: 0.32, contraction: 0.35, grain: 0.30, blur: 0.28 },
  despair:       { pulseSpeed:11.0, pulseDepth: 0.04, glowStrength: 0.20, contraction: 0.25, grain: 0.20, blur: 0.40 },
  guilt:         { pulseSpeed: 6.0, pulseDepth: 0.05, glowStrength: 0.28, contraction: 0.72, grain: 0.38, blur: 0.28 },
  disconnection: { pulseSpeed: 9.0, pulseDepth: 0.04, glowStrength: 0.22, contraction: 0.30, grain: 0.22, blur: 0.35 },
  unresolved:    { pulseSpeed: 5.5, pulseDepth: 0.05, glowStrength: 0.30, contraction: 0.40, grain: 0.35, blur: 0.20 },
  default:       { pulseSpeed: 5.5, pulseDepth: 0.05, glowStrength: 0.30, contraction: 0.35, grain: 0.30, blur: 0.20 },
}

// ─── Breath profiles (ms) ─────────────────────────────────────────────────────

export const BREATH_PROFILES: Record<PatternId | 'default', MirrorBreathProfile> = {
  overwhelm:     { inhale: 4000, holdIn: 500,  exhale: 6000, holdOut: 500  },
  anxiety:       { inhale: 4000, holdIn: 0,    exhale: 8000, holdOut: 500  },
  shame:         { inhale: 4000, holdIn: 2000, exhale: 5000, holdOut: 500  },
  anger:         { inhale: 3000, holdIn: 0,    exhale: 6000, holdOut: 1000 },
  freeze:        { inhale: 4000, holdIn: 1000, exhale: 5000, holdOut: 1000 },
  grief:         { inhale: 5000, holdIn: 1000, exhale: 6000, holdOut: 1000 },
  depletion:     { inhale: 5000, holdIn: 500,  exhale: 6000, holdOut: 1500 },
  confusion:     { inhale: 4000, holdIn: 500,  exhale: 5000, holdOut: 500  },
  isolation:     { inhale: 5000, holdIn: 1000, exhale: 6000, holdOut: 500  },
  despair:       { inhale: 5000, holdIn: 1000, exhale: 7000, holdOut: 1000 },
  guilt:         { inhale: 4000, holdIn: 1000, exhale: 5000, holdOut: 500  },
  disconnection: { inhale: 4000, holdIn: 1000, exhale: 5000, holdOut: 500  },
  unresolved:    { inhale: 4000, holdIn: 500,  exhale: 5000, holdOut: 800  },
  default:       { inhale: 4000, holdIn: 1000, exhale: 5000, holdOut: 1000 },
}

// ─── Return mode trigger patterns ────────────────────────────────────────────

export const RETURN_MODE_PATTERNS: PatternId[] = [
  'overwhelm', 'shame', 'despair', 'anxiety', 'freeze',
] as PatternId[]

export function shouldTriggerReturnMode(
  safetyTier: SafetyTier,
  pattern: PatternId,
): boolean {
  return safetyTier !== 'green' || RETURN_MODE_PATTERNS.includes(pattern)
}

// ─── Pattern metadata ─────────────────────────────────────────────────────────

export type PatternMeta = {
  id: PatternId
  keywords: string[]
  softSignals?: {
    collapse?: number
    pressure?: number
    lowAgency?: number
    futureLeak?: number
    pastLeak?: number
    abstract?: number
    spiritual?: number
    selfDensity?: number
  }
  secondary?: PatternId
  distortionType: string
  timeOrientation: TimeOrientation
  agencyState: AgencyState
  baseIntensity: number
  bodyLocation: string
  seen: string
  shiftPhrase: string
  microPractice: string
  nextStep?: string
}

export const PATTERN_LIBRARY: PatternMeta[] = [
  {
    id: 'overwhelm',
    keywords: ['overwhelm', 'too much', 'drowning', 'chaos', 'everything at once', 'all at once', 'piling up', 'can\'t breathe'],
    softSignals: { collapse: 1, pressure: 3 },
    secondary: 'freeze',
    distortionType: 'magnitude conflation',
    timeOrientation: 'present',
    agencyState: 'limited',
    baseIntensity: 0.75,
    bodyLocation: 'chest',
    seen: 'Everything is arriving at once. The system is registering more than it can sort.',
    shiftPhrase: 'Only this breath. Only this.',
    microPractice: 'Feel both feet. Name three things you can touch.',
    nextStep: 'Write one thing only.',
  },
  {
    id: 'anxiety',
    keywords: ['anxious', 'anxiety', 'worry', 'scared', 'fear', 'afraid', 'dread', 'panic', 'what if', 'terrified', 'on edge'],
    softSignals: { futureLeak: 2, pressure: 2 },
    distortionType: 'future-casting',
    timeOrientation: 'future',
    agencyState: 'limited',
    baseIntensity: 0.65,
    bodyLocation: 'throat/chest',
    seen: 'The mind is running scenarios. The body has already responded as though they are real.',
    shiftPhrase: 'This moment is survivable.',
    microPractice: 'Slow the exhale. Twice the inhale length.',
  },
  {
    id: 'shame',
    keywords: ['shame', 'worthless', 'failure', 'wrong with me', 'defective', 'broken', 'not good enough', "i'm bad", 'humiliated'],
    softSignals: { lowAgency: 1, selfDensity: 0.18 },
    distortionType: 'identity collapse',
    timeOrientation: 'past',
    agencyState: 'collapsed',
    baseIntensity: 0.72,
    bodyLocation: 'belly',
    seen: 'A moment of difficulty has been taken as evidence about who you are.',
    shiftPhrase: 'This moment is not the whole of you.',
    microPractice: 'One hand on chest. Breathe into the warmth.',
  },
  {
    id: 'anger',
    keywords: ['angry', 'rage', 'furious', 'unfair', 'frustrated', 'resentment', 'pissed', 'livid', 'bitter', 'fed up'],
    softSignals: { pressure: 2 },
    distortionType: 'threat permanence',
    timeOrientation: 'present',
    agencyState: 'available',
    baseIntensity: 0.70,
    bodyLocation: 'jaw/shoulders',
    seen: 'Something has been violated. A boundary, an expectation, a sense of rightness.',
    shiftPhrase: 'The contraction is energy. It can move.',
    microPractice: 'Three long exhales. Jaw soften on each one.',
    nextStep: 'One thing you can act on. Just one.',
  },
  {
    id: 'freeze',
    keywords: ["can't start", 'procrastinat', 'paralyz', 'frozen', 'blocked', 'stuck', 'inertia', "can't move"],
    softSignals: { lowAgency: 2 },
    secondary: 'anxiety',
    distortionType: 'magnitude threat',
    timeOrientation: 'future',
    agencyState: 'collapsed',
    baseIntensity: 0.60,
    bodyLocation: 'legs/pelvis',
    seen: 'Movement feels impossible. The gap between intention and action is registering as danger.',
    shiftPhrase: 'The smallest next step exists.',
    microPractice: 'Name one action under two minutes. Begin only there.',
    nextStep: 'What is the one smallest move?',
  },
  {
    id: 'grief',
    keywords: ['grief', 'loss', 'miss', 'gone', 'cry', 'mourning', 'bereft', 'heartbroken', 'grieving', 'lost someone'],
    softSignals: { pastLeak: 1, collapse: 1 },
    distortionType: 'absence weight',
    timeOrientation: 'past',
    agencyState: 'limited',
    baseIntensity: 0.68,
    bodyLocation: 'heart/throat',
    seen: 'Something that mattered is no longer present. The space it occupied is being felt.',
    shiftPhrase: 'Grief is love without a landing place.',
    microPractice: 'Let it be felt. Don\'t explain it. Only notice.',
  },
  {
    id: 'depletion',
    keywords: ['tired', 'exhausted', 'drained', 'depleted', 'burned', 'worn out', 'running on empty', 'spent', 'no energy'],
    softSignals: { pressure: 2, collapse: 1 },
    distortionType: 'resource scarcity',
    timeOrientation: 'present',
    agencyState: 'limited',
    baseIntensity: 0.55,
    bodyLocation: 'whole body',
    seen: 'The reserves are genuinely low. The system is asking for rest, not weakness.',
    shiftPhrase: 'Rest is not failure. It is re-sourcing.',
    microPractice: 'Lie down if possible. Two minutes horizontal.',
    nextStep: 'Protect one hour. Not productive. Yours.',
  },
  {
    id: 'confusion',
    keywords: ["don't know", 'confused', 'lost', 'unclear', 'uncertain', 'unsure', "can't decide", 'no idea'],
    softSignals: { futureLeak: 1 },
    distortionType: 'uncertainty emergency',
    timeOrientation: 'future',
    agencyState: 'limited',
    baseIntensity: 0.45,
    bodyLocation: 'head',
    seen: 'The path forward is not yet clear. Multiple possibilities exist without resolution.',
    shiftPhrase: 'Not knowing is an honest place.',
    microPractice: 'Breathe into the not-knowing. No resolution needed now.',
  },
  {
    id: 'isolation',
    keywords: ['lonely', 'alone', 'isolated', 'no one', 'nobody', 'invisible', 'left out', 'unseen'],
    softSignals: { lowAgency: 1, collapse: 1 },
    secondary: 'grief',
    distortionType: 'separation permanence',
    timeOrientation: 'present',
    agencyState: 'limited',
    baseIntensity: 0.60,
    bodyLocation: 'chest',
    seen: 'A sense of disconnection from others is present. The need for contact is real.',
    shiftPhrase: 'The longing itself is connection.',
    microPractice: 'One breath. Feel the aliveness in your body.',
    nextStep: 'Reach out to one person. Brief is enough.',
  },
  {
    id: 'despair',
    keywords: ['hopeless', 'no point', 'pointless', 'futile', 'nothing matters', 'why bother', 'giving up', 'no hope'],
    softSignals: { lowAgency: 2, collapse: 2, futureLeak: 1 },
    distortionType: 'future foreclosure',
    timeOrientation: 'future',
    agencyState: 'collapsed',
    baseIntensity: 0.82,
    bodyLocation: 'chest/belly',
    seen: 'Something has collapsed into a feeling of no way forward. The horizon feels closed.',
    shiftPhrase: 'This is a state. States move.',
    microPractice: 'One breath. Only this moment. Nothing further required.',
  },
  {
    id: 'guilt',
    keywords: ['guilt', 'regret', 'should have', 'i failed', 'i hurt', 'i let down', 'my fault', 'messed up'],
    softSignals: { pastLeak: 2, selfDensity: 0.18 },
    secondary: 'shame',
    distortionType: 'rumination loop',
    timeOrientation: 'past',
    agencyState: 'limited',
    baseIntensity: 0.65,
    bodyLocation: 'belly',
    seen: 'Something from the past is still active — being reviewed, judged, re-examined.',
    shiftPhrase: 'The past cannot be changed. Only met.',
    microPractice: 'Exhale fully. Let the event be in the past.',
    nextStep: 'One repair if possible. One release if not.',
  },
  {
    id: 'disconnection',
    keywords: ['numb', 'disconnected', 'empty', 'flat', 'nothing', 'dissociat', 'not there', 'checked out', 'hollow'],
    softSignals: { abstract: 2, collapse: 1, spiritual: 1 },
    secondary: 'depletion',
    distortionType: 'self-loss',
    timeOrientation: 'present',
    agencyState: 'collapsed',
    baseIntensity: 0.45,
    bodyLocation: 'whole body',
    seen: 'The system has gone quiet and flat. Contact with sensation feels distant or absent.',
    shiftPhrase: 'Numbness is the nervous system protecting you.',
    microPractice: 'Notice any sensation however faint. That is contact.',
  },
]
