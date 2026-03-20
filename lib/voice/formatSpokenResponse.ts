import type { MirrorState } from '@/lib/mirror/types'
import type { VoiceOutcomeMode } from '@/lib/voice/resolveVoiceOutcome'

export type VoiceSpokenResponse = {
  seenLine: string
  shiftLine: string
  paceLine?: string
  fullText: string
}

const VAGUE_VALUES = new Set(['', 'unresolved', 'unsettled'])

function extractNamedEmotion(rawInput: string): string | null {
  const lower = rawInput.toLowerCase()

  const emotionMap: Array<[RegExp, string]> = [
    [/(^|\b)(sad|sadness)(\b|$)/, 'Sadness is here.'],
    [/(^|\b)(anxious|anxiety)(\b|$)/, 'Anxiety is here.'],
    [/(^|\b)(overwhelmed|overwhelm)(\b|$)/, 'Overwhelm is here.'],
    [/(^|\b)(angry|anger|mad)(\b|$)/, 'Anger is here.'],
    [/(^|\b)(afraid|fearful|scared|fear)(\b|$)/, 'Fear is here.'],
    [/(^|\b)(lonely|alone|isolation)(\b|$)/, 'Loneliness is here.'],
    [/(^|\b)(grief|grieving)(\b|$)/, 'Grief is here.'],
  ]

  for (const [pattern, label] of emotionMap) {
    if (pattern.test(lower)) return label
  }

  return null
}

function normalizeSentence(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''
  if (/[.!?]$/.test(trimmed)) return trimmed
  return trimmed + '.'
}

function shortenLine(text: string, maxWords = 12): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return normalizeSentence(text)
  return normalizeSentence(words.slice(0, maxWords).join(' '))
}

function categoryLines(pattern: MirrorState['primaryPattern']) {
  switch (pattern) {
    case 'unsettled':
      return {
        seenLine: 'This feels off.',
        shiftLine: 'Stay close to what is here before naming it.',
        paceLine: 'One slower breath.',
      }
    case 'unclear':
      return {
        seenLine: 'It is not clear yet.',
        shiftLine: 'You do not need to force a name yet.',
        paceLine: 'Stay with one breath.',
      }
    case 'mixed':
      return {
        seenLine: 'Two pulls may be here at once.',
        shiftLine: 'Let both sides have a little room.',
        paceLine: 'Name the first truth, then the second.',
      }
    case 'tender':
      return {
        seenLine: 'Something tender is here.',
        shiftLine: 'Gentleness is a valid response.',
        paceLine: 'One softer breath.',
      }
    case 'threshold':
      return {
        seenLine: 'The old shape may no longer fit.',
        shiftLine: 'You do not need to name the next shape yet.',
        paceLine: 'One steady breath.',
      }
    default:
      return null
  }
}

function pickSeenLine(state: MirrorState): string {
  const category = categoryLines(state.primaryPattern)
  if (category) return category.seenLine

  const candidate = (state.seen ?? '').trim()
  if (candidate && !VAGUE_VALUES.has(candidate.toLowerCase())) {
    return shortenLine(candidate, 8)
  }

  const named = extractNamedEmotion(state.rawInput ?? '')
  if (named) return named

  return 'Something is here.'
}

function pickShiftLine(state: MirrorState): string {
  const category = categoryLines(state.primaryPattern)
  if (category) return category.shiftLine

  const candidate = (state.shiftPhrase ?? '').trim()
  if (candidate) return shortenLine(candidate, 14)
  return 'Stay with one steady breath.'
}

function firstSentence(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''
  const match = trimmed.match(/.*?[.!?](\s|$)/)
  return match ? match[0].trim() : trimmed
}

function pickPaceLine(state: MirrorState): string {
  const category = categoryLines(state.primaryPattern)
  if (category) return category.paceLine

  const candidate = firstSentence(state.microPractice ?? '')
  if (candidate) return shortenLine(candidate, 12)
  return 'Slow the exhale.'
}

export function formatSpokenResponse(
  state: MirrorState,
  mode: VoiceOutcomeMode = 'normal'
): VoiceSpokenResponse {
  let seenLine = pickSeenLine(state)
  let shiftLine = pickShiftLine(state)
  let paceLine = pickPaceLine(state)

  if (mode === 'lowConfidence') {
    const namedEmotion = extractNamedEmotion(state.rawInput ?? '')

    if (namedEmotion) {
      seenLine = namedEmotion
      shiftLine = 'Stay with one steady breath.'
      paceLine = 'One breath.'
    } else {
      const category = categoryLines(state.primaryPattern)
      if (category) {
        seenLine = category.seenLine
        shiftLine = category.shiftLine
        paceLine = category.paceLine
      } else if (/\bi don['’]?t know\b|\bnot sure\b|\bunclear\b|\bcan['’]?t tell\b/.test((state.rawInput ?? '').toLowerCase())) {
        seenLine = 'It is not clear yet.'
        shiftLine = 'You do not need to force a name yet.'
        paceLine = 'Stay with one breath.'
      } else if (/\b(feels? off|weird|strange|odd|not right)\b/.test((state.rawInput ?? '').toLowerCase())) {
        seenLine = 'This feels off.'
        shiftLine = 'Stay close to what is here before naming it.'
        paceLine = 'One slower breath.'
      } else if (/\bnot okay\b|\btoo much\b|\bcan['’]?t cope\b|\bstruggling\b/.test((state.rawInput ?? '').toLowerCase())) {
        seenLine = 'This feels like too much.'
        shiftLine = 'Make the next moment smaller.'
        paceLine = 'Slow the exhale.'
      } else {
        seenLine = 'Something wants attention.'
        shiftLine = 'Stay with what is here before reaching outward.'
        paceLine = 'One breath.'
      }
    }
  }

  if (mode === 'distress') {
    seenLine = extractNamedEmotion(state.rawInput ?? '') ?? 'This is heavy.'
    shiftLine = 'Come back to what is here.'
    paceLine = 'Slow the exhale.'
  }

  if (mode === 'crisis') {
    seenLine = 'Pause here.'
    shiftLine = 'Take one slower breath.'
    paceLine = 'Support is available now.'
  }

  const fullText = [seenLine, shiftLine, paceLine].filter(Boolean).join(' ')

  return {
    seenLine,
    shiftLine,
    paceLine,
    fullText,
  }
}
