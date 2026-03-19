import type { MirrorState } from '@/lib/mirror/types'

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

function pickSeenLine(state: MirrorState): string {
  const candidate = (state.seen ?? '').trim()
  if (candidate && !VAGUE_VALUES.has(candidate.toLowerCase())) {
    return shortenLine(candidate, 10)
  }

  const named = extractNamedEmotion(state.rawInput ?? '')
  if (named) return named

  return 'Something difficult is here.'
}

function pickShiftLine(state: MirrorState): string {
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
  const candidate = firstSentence(state.microPractice ?? '')
  if (candidate) return shortenLine(candidate, 12)
  return 'Slow the exhale.'
}

export function formatSpokenResponse(state: MirrorState): VoiceSpokenResponse {
  const seenLine = pickSeenLine(state)
  const shiftLine = pickShiftLine(state)
  const paceLine = pickPaceLine(state)

  const fullText = [seenLine, shiftLine, paceLine]
    .filter(Boolean)
    .join(' ')

  return {
    seenLine,
    shiftLine,
    paceLine,
    fullText,
  }
}
