import type { MirrorState } from '@/lib/mirror/types'

export type VoiceOutcomeMode = 'normal' | 'lowConfidence' | 'distress' | 'crisis'

export type VoiceOutcome = {
  mode: VoiceOutcomeMode
}

const DISTRESS_PATTERNS = new Set([
  'panic',
  'overload',
  'spiral',
  'collapse',
  'shutdown',
  'freeze',
])

function isLowConfidence(state: MirrorState): boolean {
  return state.primaryPattern === 'unresolved'
    || state.primaryPattern === 'unsettled'
    || state.confidence < 0.5
}

export function resolveVoiceOutcome(state: MirrorState): VoiceOutcome {
  if (state.safetyTier === 'red') {
    return { mode: 'crisis' }
  }

  if (state.safetyTier === 'amber' || DISTRESS_PATTERNS.has(state.primaryPattern)) {
    return { mode: 'distress' }
  }

  if (isLowConfidence(state)) {
    return { mode: 'lowConfidence' }
  }

  return { mode: 'normal' }
}
