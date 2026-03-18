import type { SafetyTier } from '../types'

type ScanResult = {
  tier: SafetyTier
  triggered: string | null
  shouldReturnMode: boolean
}

const CRISIS = [
  'kill myself', 'end my life', "don't want to be here", 'want to die',
  'suicidal', 'suicide', 'self harm', 'self-harm', 'cut myself', 'hurt myself',
  'no reason to live', 'rather be dead', "can't go on", 'not worth living',
  'end it all', 'take my own life', 'ending my life',
]

const ELEVATED = [
  "can't cope anymore", 'completely falling apart', 'breaking down',
  'losing my mind', 'nothing left', 'totally hopeless', 'nothing to live for',
  'rock bottom', "can't take it anymore", 'falling to pieces',
  'completely broken', "can't hold on", 'at the end of my rope',
]

const RETURN_TRIGGERS = [
  'spiral', 'spiraling', 'spinning out', 'dissociat', 'not real',
  'nothing is real', 'losing it', 'can\'t stop', 'can\'t breathe',
  'full collapse', 'complete shutdown', 'total overwhelm',
]

export function safetyScan(text: string): ScanResult {
  const lower = text.toLowerCase()

  for (const phrase of CRISIS) {
    if (lower.includes(phrase)) {
      return { tier: 'red', triggered: phrase, shouldReturnMode: true }
    }
  }

  for (const phrase of ELEVATED) {
    if (lower.includes(phrase)) {
      return { tier: 'amber', triggered: phrase, shouldReturnMode: true }
    }
  }

  for (const phrase of RETURN_TRIGGERS) {
    if (lower.includes(phrase)) {
      return { tier: 'amber', triggered: phrase, shouldReturnMode: true }
    }
  }

  return { tier: 'green', triggered: null, shouldReturnMode: false }
}
