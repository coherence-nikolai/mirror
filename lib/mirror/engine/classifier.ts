import type { PatternId, TimeOrientation, AgencyState } from '../types'
import { PATTERN_LIBRARY, type PatternMeta } from '../constants'

// ─── Linguistic signal families ───────────────────────────────────────────────

const PRESSURE_SIGNALS = [
  'keep', 'still', 'again', 'always', 'never', 'every time', 'constantly',
  'all the time', 'just', 'only', 'so much', 'too much', 'enough',
  'trying to', 'supposed to', 'have to', 'need to', 'should',
  "can't keep", "can't stop", "can't escape",
]

const COLLAPSE_SIGNALS = [
  'falling apart', 'falling away', 'crumbling', 'dissolving', 'disappearing',
  'slipping', 'losing ground', 'losing myself', 'not myself', 'unraveling',
  'fracturing', 'breaking', 'about to', 'on the edge', 'threshold',
  "don't know who", 'not sure what', 'nothing feels real',
  'going through the motions',
]

const LOW_AGENCY_SIGNALS = [
  'nothing i can do', 'no way out', "can't change", "can't do anything",
  'out of my hands', 'powerless', 'helpless', 'no choice', 'trapped',
  "can't see a way", 'at the mercy', 'just happens to me',
  'always happens', 'never changes',
]

const ABSTRACT_SIGNALS = [
  'interesting that', "it's fascinating", 'i notice that', 'i observe',
  'one might say', 'there is a sense', 'it seems as though', 'theoretically',
  'objectively speaking', 'philosophically', 'existential', 'ontological',
  "it's almost as if", 'in some ways', 'sort of like', 'i suppose', 'perhaps i',
]

const SPIRITUAL_DISTRESS = [
  'dark night', 'contraction', 'no ground', 'groundless', 'dissolution',
  'emptiness but not peaceful', 'lost the thread', 'frequency dropped',
  'density', 'heaviness', "practice isn't working", "can't meditate",
  'dryness', 'nothing is landing', 'nothing is moving',
]

const PAST_LEAKAGE = [
  'if only', 'should have', 'would have', 'could have', 'back when',
  'used to', 'i remember when', 'since that happened', 'still think about',
  'keeps coming back', "can't let go of", 'keeps replaying',
]

const FUTURE_LEAKAGE = [
  'what if', 'when this happens', 'what will', 'by then',
  'if i don\'t', 'unless i', 'going to fail', 'going to lose',
  "i'll never", 'it will always', 'nothing will ever', "it won't work",
]

const UNSETTLED_SIGNALS = [
  'weird', 'off', 'strange', 'odd', 'not right', 'unsettled',
]

const UNCLEAR_SIGNALS = [
  "don't know", 'not sure', 'unclear', "can't tell", 'foggy', 'no idea',
]

const MIXED_SIGNALS = [
  'mixed', 'conflicted', 'torn', 'two things at once', 'both true', 'part of me',
]

const TENDER_SIGNALS = [
  'tender', 'vulnerable', 'raw', 'soft', 'hurt', 'exposed', 'sensitive',
]

const THRESHOLD_SIGNALS = [
  'in-between', 'between things', 'shifting', 'changing', 'transition', 'threshold', 'on the cusp',
]

// ─── Signal map ───────────────────────────────────────────────────────────────

export type SignalMap = {
  pressure:   string[]
  collapse:   string[]
  lowAgency:  string[]
  abstract:   string[]
  spiritual:  string[]
  pastLeak:   string[]
  futureLeak: string[]
  unsettled:  string[]
  unclear:    string[]
  mixed:      string[]
  tender:     string[]
  threshold:  string[]
  selfDensity: number
}

export function detectSignals(text: string): SignalMap {
  const lower = text.toLowerCase()
  const check = (signals: string[]) => signals.filter(s => lower.includes(s))
  const words = lower.split(/\s+/).filter(Boolean)
  const iCount = words.filter(w => /^i[',.]?$/.test(w)).length
  return {
    pressure:    check(PRESSURE_SIGNALS),
    collapse:    check(COLLAPSE_SIGNALS),
    lowAgency:   check(LOW_AGENCY_SIGNALS),
    abstract:    check(ABSTRACT_SIGNALS),
    spiritual:   check(SPIRITUAL_DISTRESS),
    pastLeak:    check(PAST_LEAKAGE),
    futureLeak:  check(FUTURE_LEAKAGE),
    unsettled:   check(UNSETTLED_SIGNALS),
    unclear:     check(UNCLEAR_SIGNALS),
    mixed:       check(MIXED_SIGNALS),
    tender:      check(TENDER_SIGNALS),
    threshold:   check(THRESHOLD_SIGNALS),
    selfDensity: words.length > 0 ? iCount / words.length : 0,
  }
}

function intensityBoost(signals: SignalMap, base: number): number {
  let boost = 0
  if (signals.pressure.length   >= 3) boost += 0.08
  if (signals.collapse.length   >= 1) boost += 0.12
  if (signals.lowAgency.length  >= 2) boost += 0.10
  if (signals.spiritual.length  >= 1) boost += 0.06
  if (signals.abstract.length   >= 2 && signals.collapse.length >= 1) boost += 0.10
  return Math.min(1.0, base + boost)
}

function deriveTimeOrientation(signals: SignalMap, fallback: TimeOrientation): TimeOrientation {
  const past   = signals.pastLeak.length
  const future = signals.futureLeak.length
  if (past > 0 && future > 0) return 'mixed'
  if (past   > future) return 'past'
  if (future > past)   return 'future'
  return fallback
}

function deriveAgencyState(signals: SignalMap, base: AgencyState): AgencyState {
  if (signals.lowAgency.length >= 2) return 'collapsed'
  if (signals.lowAgency.length === 1) return 'limited'
  return base
}

function softMatchOk(meta: PatternMeta, signals: SignalMap): boolean {
  const s = meta.softSignals
  if (!s) return false
  if (s.collapse    != null && signals.collapse.length    < s.collapse)    return false
  if (s.pressure    != null && signals.pressure.length    < s.pressure)    return false
  if (s.lowAgency   != null && signals.lowAgency.length   < s.lowAgency)   return false
  if (s.futureLeak  != null && signals.futureLeak.length  < s.futureLeak)  return false
  if (s.pastLeak    != null && signals.pastLeak.length    < s.pastLeak)    return false
  if (s.abstract    != null && signals.abstract.length    < s.abstract)    return false
  if (s.spiritual   != null && signals.spiritual.length   < s.spiritual)   return false
  if ((s as any).unsettled  != null && signals.unsettled.length  < (s as any).unsettled)  return false
  if ((s as any).unclear    != null && signals.unclear.length    < (s as any).unclear)    return false
  if ((s as any).mixed      != null && signals.mixed.length      < (s as any).mixed)      return false
  if ((s as any).tender     != null && signals.tender.length     < (s as any).tender)     return false
  if ((s as any).threshold  != null && signals.threshold.length  < (s as any).threshold)  return false
  if (s.selfDensity != null && signals.selfDensity        < s.selfDensity) return false
  return true
}

// ─── Classification result ────────────────────────────────────────────────────

export type ClassificationResult = {
  pattern:         PatternMeta | null
  signals:         SignalMap
  intensity:       number
  timeOrientation: TimeOrientation
  agencyState:     AgencyState
  confidence:      number
}

export function classify(rawText: string): ClassificationResult {
  const signals = detectSignals(rawText)
  const lower   = rawText.toLowerCase()

  // 1. Keyword match
  let matched: PatternMeta | null = null
  for (const p of PATTERN_LIBRARY) {
    if (p.keywords.some(k => lower.includes(k))) { matched = p; break }
  }

  // 2. Soft signal match
  if (!matched) {
    for (const p of PATTERN_LIBRARY) {
      if (softMatchOk(p, signals)) { matched = p; break }
    }
  }

  // 3. Fallback routing
  if (!matched && signals.mixed.length >= 1) {
    matched = PATTERN_LIBRARY.find(p => p.id === 'mixed') ?? null
  }
  if (!matched && signals.tender.length >= 1) {
    matched = PATTERN_LIBRARY.find(p => p.id === 'tender') ?? null
  }
  if (!matched && signals.threshold.length >= 1) {
    matched = PATTERN_LIBRARY.find(p => p.id === 'threshold') ?? null
  }
  if (!matched && signals.unclear.length >= 1) {
    matched = PATTERN_LIBRARY.find(p => p.id === 'unclear') ?? null
  }
  if (!matched && signals.unsettled.length >= 1) {
    matched = PATTERN_LIBRARY.find(p => p.id === 'unsettled') ?? null
  }
  if (!matched && signals.spiritual.length >= 1) {
    matched = PATTERN_LIBRARY.find(p => p.id === 'disconnection') ?? null
  }
  if (!matched && signals.collapse.length  >= 2) {
    matched = PATTERN_LIBRARY.find(p => p.id === 'overwhelm')     ?? null
  }
  if (!matched && signals.lowAgency.length >= 2) {
    matched = PATTERN_LIBRARY.find(p => p.id === 'freeze')        ?? null
  }

  const base      = matched?.baseIntensity ?? 0.40
  const intensity = intensityBoost(signals, base)
  const time      = deriveTimeOrientation(signals, matched?.timeOrientation ?? 'present')
  const agency    = deriveAgencyState(signals, matched?.agencyState ?? 'available')

  // Confidence: keyword match = 0.85, soft = 0.65, fallback = 0.45, none = 0.30
  const nuanceSignals = signals.unsettled.length + signals.unclear.length + signals.mixed.length + signals.tender.length + signals.threshold.length
  const confidence = matched
    ? matched.keywords.some(k => lower.includes(k)) ? 0.85 : 0.65
    : signals.collapse.length + signals.lowAgency.length > 0 ? 0.45
    : nuanceSignals > 0 ? 0.52
    : 0.30

  return { pattern: matched, signals, intensity, timeOrientation: time, agencyState: agency, confidence }
}

export function patternToId(p: PatternMeta | null): PatternId {
  return (p?.id as PatternId) ?? 'unresolved'
}
