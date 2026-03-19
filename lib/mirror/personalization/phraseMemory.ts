'use client'

import { lsGet, lsSet } from '../storage/localStore'
import type { PatternId, ToneStyle } from '../types'

const PHRASE_KEY   = 'mirror.phrases'
const PATTERN_KEY  = 'mirror.patterns'
const TONE_KEY     = 'mirror.tone'

export type PhraseRecord = {
  phrase:      string
  pattern:     PatternId
  helpedCount: number
  usedCount:   number
  lastUsed:    string
}

// ─── Phrase memory ────────────────────────────────────────────────────────────

export function recordPhrase(phrase: string, pattern: PatternId, helped: boolean | null): void {
  const phrases = lsGet<PhraseRecord[]>(PHRASE_KEY, [])
  const existing = phrases.find(p => p.phrase === phrase)
  if (existing) {
    existing.usedCount++
    if (helped) existing.helpedCount++
    existing.lastUsed = new Date().toISOString()
  } else {
    phrases.push({
      phrase, pattern,
      helpedCount: helped ? 1 : 0,
      usedCount: 1,
      lastUsed: new Date().toISOString(),
    })
  }
  lsSet(PHRASE_KEY, phrases)
}

export function getEffectivePhrases(pattern?: PatternId): PhraseRecord[] {
  const phrases = lsGet<PhraseRecord[]>(PHRASE_KEY, [])
  return phrases
    .filter(p => !pattern || p.pattern === pattern)
    .filter(p => p.helpedCount > 0)
    .sort((a, b) => b.helpedCount - a.helpedCount)
    .slice(0, 5)
}

export function getAllPhrases(): PhraseRecord[] {
  return lsGet<PhraseRecord[]>(PHRASE_KEY, [])
}

export function clearPhrases(): void {
  lsSet(PHRASE_KEY, [])
}

// ─── Pattern memory ───────────────────────────────────────────────────────────

export function recordPattern(pattern: PatternId): void {
  const map = lsGet<Record<string, number>>(PATTERN_KEY, {})
  map[pattern] = (map[pattern] ?? 0) + 1
  lsSet(PATTERN_KEY, map)
}

export function getPatternFrequency(): Array<{ pattern: PatternId; count: number }> {
  const map = lsGet<Record<string, number>>(PATTERN_KEY, {})
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([pattern, count]) => ({ pattern: pattern as PatternId, count }))
}

export function getTopPatterns(n = 3): PatternId[] {
  return getPatternFrequency().slice(0, n).map(x => x.pattern)
}

export function clearPatterns(): void {
  lsSet(PATTERN_KEY, {})
}

// ─── Tone preference ──────────────────────────────────────────────────────────

export type TonePrefs = {
  preferred:   ToneStyle
  softerCount: number
  directCount: number
}

export function getTonePrefs(): TonePrefs {
  return lsGet<TonePrefs>(TONE_KEY, { preferred: 'clean', softerCount: 0, directCount: 0 })
}

export function recordRetry(direction: 'softer' | 'direct'): void {
  const prefs = getTonePrefs()
  if (direction === 'softer') prefs.softerCount++
  else prefs.directCount++
  // Update preferred based on history
  if (prefs.softerCount > prefs.directCount + 2) prefs.preferred = 'soft'
  else if (prefs.directCount > prefs.softerCount + 2) prefs.preferred = 'direct'
  lsSet(TONE_KEY, prefs)
}

export function clearTonePrefs(): void {
  lsSet(TONE_KEY, { preferred: 'clean', softerCount: 0, directCount: 0 })
}
