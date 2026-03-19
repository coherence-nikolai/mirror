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

function matchesVagueInput(rawInput: string): boolean {
  const lower = rawInput.toLowerCase().trim()

  return (
    /\bi feel weird\b/.test(lower)
    || /\bfeel weird\b/.test(lower)
    || /\bsomething feels off\b/.test(lower)
    || /\bfeels off\b/.test(lower)
    || /\bi don['’]?t know\b/.test(lower)
    || /\bdon['’]?t know\b/.test(lower)
    || /\bi['’]?m not okay\b/.test(lower)
    || /\bim not okay\b/.test(lower)
    || /\bnot okay\b/.test(lower)
    || /\bnot ok\b/.test(lower)
  )
}

export function resolveVoiceOutcome(state: MirrorState): VoiceOutcome {
  if (state.safetyTier === 'red') {
    return { mode: 'crisis' }
  }

  if (state.safetyTier === 'amber' || DISTRESS_PATTERNS.has(state.primaryPattern)) {
    return { mode: 'distress' }
  }

  if (matchesVagueInput(state.rawInput ?? '')) {
    return { mode: 'lowConfidence' }
  }

  if (isLowConfidence(state)) {
    return { mode: 'lowConfidence' }
  }

  return { mode: 'normal' }
}
