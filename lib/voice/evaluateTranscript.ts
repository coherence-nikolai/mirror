export type TranscriptRetryReason =
  | 'empty'
  | 'filler'
  | 'tooShort'
  | 'lowConfidence'

export type TranscriptAssessment =
  | {
      status: 'ok'
      cleanedTranscript: string
    }
  | {
      status: 'retry'
      cleanedTranscript: string
      reason: TranscriptRetryReason
    }

const FILLER_PATTERNS = [
  /^um+$/i,
  /^uh+$/i,
  /^erm+$/i,
  /^hmm+$/i,
  /^mm+$/i,
  /^ah+$/i,
  /^er+$/i,
  /^like$/i,
  /^you know$/i,
]

const MEANINGFUL_SHORT_PATTERNS = [
  /sad/i,
  /anxious/i,
  /anxiety/i,
  /overwhelmed/i,
  /angry/i,
  /mad/i,
  /fear/i,
  /scared/i,
  /afraid/i,
  /lonely/i,
  /grief/i,
  /tired/i,
  /exhausted/i,
  /help/i,
]

function cleanTranscript(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

function wordCount(text: string): number {
  return cleanTranscript(text).split(/\s+/).filter(Boolean).length
}

function isFillerOnly(text: string): boolean {
  const cleaned = cleanTranscript(text).toLowerCase()
  if (!cleaned) return false
  return FILLER_PATTERNS.some(pattern => pattern.test(cleaned))
}

function isMeaningfulShort(text: string): boolean {
  return MEANINGFUL_SHORT_PATTERNS.some(pattern => pattern.test(text))
}

export function evaluateTranscript(
  transcript: string,
  confidence?: number
): TranscriptAssessment {
  const cleanedTranscript = cleanTranscript(transcript)

  if (!cleanedTranscript) {
    return { status: 'retry', cleanedTranscript: '', reason: 'empty' }
  }

  if (isFillerOnly(cleanedTranscript)) {
    return { status: 'retry', cleanedTranscript, reason: 'filler' }
  }

  const words = wordCount(cleanedTranscript)
  if (words <= 1 && !isMeaningfulShort(cleanedTranscript)) {
    return { status: 'retry', cleanedTranscript, reason: 'tooShort' }
  }

  if (typeof confidence === 'number' && confidence < 0.35 && words <= 4 && !isMeaningfulShort(cleanedTranscript)) {
    return { status: 'retry', cleanedTranscript, reason: 'lowConfidence' }
  }

  return { status: 'ok', cleanedTranscript }
}

export function humanizeTranscriptRetryReason(reason: TranscriptRetryReason): string {
  switch (reason) {
    case 'empty':
      return 'I didn’t catch a clear phrase. Try one short sentence, or use text instead.'
    case 'filler':
      return 'I didn’t catch enough to reflect yet. Try one short sentence.'
    case 'tooShort':
      return 'Try one short sentence so I can reflect it back clearly.'
    case 'lowConfidence':
      return 'I’m not fully sure what I heard. Try one short sentence, or use text instead.'
    default:
      return 'Try one short sentence, or use text instead.'
  }
}
