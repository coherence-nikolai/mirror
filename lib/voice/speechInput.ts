type RecognitionResultLike = {
  transcript: string
  confidence?: number
}

type RecognitionAlternativeLike = {
  transcript: string
  confidence?: number
}

type RecognitionResultItemLike = {
  isFinal: boolean
  0: RecognitionAlternativeLike
  length: number
}

type RecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<RecognitionResultItemLike>
}

type RecognitionErrorEventLike = {
  error?: string
}

type RecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: RecognitionErrorEventLike) => void) | null
  onresult: ((event: RecognitionEventLike) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type RecognitionCtor = new () => RecognitionLike

type WindowWithSpeech = Window & typeof globalThis & {
  SpeechRecognition?: RecognitionCtor
  webkitSpeechRecognition?: RecognitionCtor
}

export type SpeechTranscriptSnapshot = {
  finalTranscript: string
  interimTranscript: string
  confidence?: number
}

export type SpeechSessionCallbacks = {
  onStart?: () => void
  onEnd?: () => void
  onError?: (message: string) => void
  onTranscript?: (snapshot: SpeechTranscriptSnapshot) => void
}

export type SpeechSessionController = {
  start: () => void
  stop: () => void
  abort: () => void
}

function getSpeechCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as WindowWithSpeech
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

function humanizeError(code?: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access is blocked. Try again or type instead.'
    case 'no-speech':
      return 'I did not catch anything. Try again or type instead.'
    case 'audio-capture':
      return 'No microphone input was detected.'
    case 'network':
      return 'Speech capture had a network problem. Try again.'
    case 'aborted':
      return 'Listening stopped.'
    default:
      return 'Voice capture did not complete. Try again or type instead.'
  }
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean(getSpeechCtor())
}

export function createSpeechSession(
  callbacks: SpeechSessionCallbacks,
  opts?: { lang?: string }
): SpeechSessionController {
  const SpeechCtor = getSpeechCtor()

  if (!SpeechCtor) {
    return {
      start: () => callbacks.onError?.('Voice capture is not available here. Type instead.'),
      stop: () => {},
      abort: () => {},
    }
  }

  const recognition = new SpeechCtor()
  recognition.continuous = false
  recognition.interimResults = true
  recognition.lang = opts?.lang ?? 'en-AU'
  recognition.maxAlternatives = 1

  let finalTranscript = ''
  let interimTranscript = ''
  let confidence: number | undefined

  recognition.onstart = () => {
    callbacks.onStart?.()
  }

  recognition.onresult = (event) => {
    finalTranscript = ''
    interimTranscript = ''

    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results[i]
      const alt = result[0]
      if (!alt) continue

      const piece = alt.transcript ?? ''
      if (result.isFinal) {
        finalTranscript += piece
        if (typeof alt.confidence === 'number') confidence = alt.confidence
      } else {
        interimTranscript += piece
      }
    }

    callbacks.onTranscript?.({
      finalTranscript: finalTranscript.trim(),
      interimTranscript: interimTranscript.trim(),
      confidence,
    })
  }

  recognition.onerror = (event) => {
    callbacks.onError?.(humanizeError(event.error))
  }

  recognition.onend = () => {
    callbacks.onEnd?.()
  }

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    abort: () => recognition.abort(),
  }
}
