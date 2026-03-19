export type SpeakCallbacks = {
  onStart?: () => void
  onEnd?: () => void
  onError?: () => void
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && typeof SpeechSynthesisUtterance !== 'undefined'
}

export function stopSpeaking() {
  if (!isSpeechSynthesisSupported()) return
  window.speechSynthesis.cancel()
}

export function speakText(text: string, callbacks?: SpeakCallbacks): boolean {
  if (!isSpeechSynthesisSupported() || !text.trim()) return false

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-AU'
  utterance.rate = 0.95
  utterance.pitch = 1.0
  utterance.volume = 1.0

  utterance.onstart = () => callbacks?.onStart?.()
  utterance.onend = () => callbacks?.onEnd?.()
  utterance.onerror = () => callbacks?.onError?.()

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
  return true
}
