'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Orb from '@/components/orb/Orb'
import ReflectionResult from '@/components/mirror/ReflectionResult'
import type { MirrorState, ToneStyle } from '@/lib/mirror/types'
import { getPrefs, DEFAULT_PREFS, type MirrorPrefs, setTempReturnState } from '@/lib/mirror/storage/prefsStore'
import { logReflection } from '@/lib/mirror/storage/historyStore'
import { recordPattern, getTonePrefs } from '@/lib/mirror/personalization/phraseMemory'
import { shouldTriggerReturnMode } from '@/lib/mirror/constants'
import { reflectLocal } from '@/lib/mirror/engine/reflectLocal'
import { createSpeechSession, isSpeechRecognitionSupported, type SpeechSessionController } from '@/lib/voice/speechInput'
import { formatSpokenResponse } from '@/lib/voice/formatSpokenResponse'
import type { VoiceSpokenResponse } from '@/lib/voice/formatSpokenResponse'
import { isSpeechSynthesisSupported, speakText, stopSpeaking } from '@/lib/voice/speechOutput'
import VoiceCapturePanel from './VoiceCapturePanel'
import VoiceResponsePlayer from './VoiceResponsePlayer'
import styles from './VoiceMirrorScreen.module.css'

function retryToTone(direction?: 'softer' | 'direct' | null): ToneStyle | undefined {
  if (direction === 'softer') return 'soft'
  if (direction === 'direct') return 'direct'
  const preferred = getTonePrefs().preferred
  return preferred === 'clean' ? undefined : preferred
}

export default function VoiceMirrorScreen() {
  const router = useRouter()
  const [prefs, setPrefs] = useState<MirrorPrefs>(DEFAULT_PREFS)
  const [supported, setSupported] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<MirrorState | null>(null)
  const [showFullReflection, setShowFullReflection] = useState(false)

  const sessionRef = useRef<SpeechSessionController | null>(null)
  const transcriptRef = useRef('')
  const confidenceRef = useRef<number | undefined>(undefined)
  const errorRef = useRef<string | null>(null)
  const spokenStateIdRef = useRef<string | null>(null)

  useEffect(() => {
    setPrefs(getPrefs())
    setSupported(isSpeechRecognitionSupported())
    setSpeechSupported(isSpeechSynthesisSupported())
  }, [])

  const voiceResponse: VoiceSpokenResponse | null = useMemo(() => {
    if (!state) return null
    return formatSpokenResponse(state)
  }, [state])

  const speakResponse = useCallback((text: string) => {
    const didStart = speakText(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    })
    if (!didStart) setSpeaking(false)
  }, [])

  const finalizeState = useCallback((nextState: MirrorState) => {
    setState(nextState)
    setShowFullReflection(false)

    if (!prefs.privateSession) {
      logReflection(nextState)
      recordPattern(nextState.primaryPattern)
    }

    if (shouldTriggerReturnMode(nextState.safetyTier, nextState.primaryPattern)) {
      if (prefs.privateSession) {
        setTempReturnState(nextState)
      }
      router.push('/return?id=' + nextState.id)
    }
  }, [prefs.privateSession, router])

  const runReflection = useCallback(async (spokenText: string, retryDirection?: 'softer' | 'direct') => {
    const trimmed = spokenText.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setState(null)
    setShowFullReflection(false)
    spokenStateIdRef.current = null
    stopSpeaking()
    setSpeaking(false)

    const tonePreference = retryToTone(retryDirection)

    try {
      if (prefs.localOnly) {
        const localState = reflectLocal({ rawInput: trimmed, tonePreference })
        finalizeState(localState)
        return
      }

      const res = await fetch('/api/mirror/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: trimmed,
          useAI: prefs.useAI,
          tonePreference,
        }),
      })

      const data = await res.json() as
        | { ok: true; state: MirrorState; repaired: boolean }
        | { ok: false; error: string; fallback?: MirrorState }

      if (data.ok) {
        finalizeState(data.state)
      } else if (data.fallback) {
        finalizeState(data.fallback)
        setError('Reflection is from local engine — ' + data.error)
      } else {
        setError(data.error)
      }
    } catch {
      if (prefs.localOnly || !prefs.useAI) {
        const localState = reflectLocal({ rawInput: trimmed, tonePreference })
        finalizeState(localState)
      } else {
        setError('Network error — please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [finalizeState, prefs.localOnly, prefs.useAI, speakResponse])

  const stopListening = useCallback(() => {
    sessionRef.current?.stop()
  }, [])

  const clearSession = useCallback(() => {
    sessionRef.current?.abort()
    sessionRef.current = null
    transcriptRef.current = ''
    confidenceRef.current = undefined
    errorRef.current = null
    spokenStateIdRef.current = null
    stopSpeaking()
    setListening(false)
    setLoading(false)
    setSpeaking(false)
    setTranscript('')
    setInterimTranscript('')
    setState(null)
    setShowFullReflection(false)
    setError(null)
  }, [])

  const startListening = useCallback(() => {
    if (!supported || listening || loading) return

    sessionRef.current?.abort()
    spokenStateIdRef.current = null
    stopSpeaking()
    transcriptRef.current = ''
    confidenceRef.current = undefined
    errorRef.current = null
    setTranscript('')
    setInterimTranscript('')
    setState(null)
    setShowFullReflection(false)
    setError(null)
    setSpeaking(false)

    const session = createSpeechSession({
      onStart: () => {
        setListening(true)
        setError(null)
      },
      onTranscript: ({ finalTranscript, interimTranscript, confidence }) => {
        transcriptRef.current = finalTranscript
        confidenceRef.current = confidence
        setTranscript(finalTranscript)
        setInterimTranscript(interimTranscript)
      },
      onError: (message) => {
        errorRef.current = message
        setError(message)
      },
      onEnd: () => {
        setListening(false)
        setInterimTranscript('')

        const finalText = transcriptRef.current.trim()
        if (finalText.length > 0) {
          void runReflection(finalText)
        } else if (!errorRef.current) {
          setError('I didn’t catch a clear phrase. Try one short sentence, or use text instead.')
        }
      },
    })

    sessionRef.current = session
    session.start()
  }, [listening, loading, runReflection, supported])

  const handleReturn = useCallback(() => {
    if (!state) return
    stopSpeaking()
    setSpeaking(false)
    if (prefs.privateSession) {
      setTempReturnState(state)
    }
    router.push('/return?id=' + state.id)
  }, [prefs.privateSession, router, state])

  useEffect(() => {
    return () => {
      sessionRef.current?.abort()
      stopSpeaking()
    }
  }, [])

  useEffect(() => {
    if (!state || !voiceResponse || !speechSupported) return
    if (spokenStateIdRef.current === state.id) return

    spokenStateIdRef.current = state.id
    speakResponse(voiceResponse.fullText)
  }, [speechSupported, speakResponse, state, voiceResponse])

  const headerRight = (
    <>
      <Link href="/mirror" className="btn">Text</Link>
      <Link href="/saved" className="btn">Saved</Link>
      <Link href="/settings" className="btn">Settings</Link>
    </>
  )

  return (
    <div className={`shell ${styles.screen}`}>
      <Header rightSlot={headerRight} />

      <div className={styles.orbArea}>
        <Orb
          visualState={state?.visualState}
          breathProfile={state?.breathProfile}
          processing={listening || loading || speaking}
          reducedMotion={prefs.reducedMotion}
        />
      </div>

      <div className={styles.stack}>
        <VoiceCapturePanel
          supported={supported}
          listening={listening}
          reflecting={loading}
          transcript={transcript}
          interimTranscript={interimTranscript}
          error={error}
          onStart={startListening}
          onStop={stopListening}
          onRetry={clearSession}
        />

        {voiceResponse && state && (
          <VoiceResponsePlayer
            response={voiceResponse}
            speechSupported={speechSupported}
            speaking={speaking}
            onReplay={() => speakResponse(voiceResponse.fullText)}
            onStop={() => {
              stopSpeaking()
              setSpeaking(false)
            }}
            onOpenReflection={() => setShowFullReflection(true)}
            onReturn={handleReturn}
            onAgain={clearSession}
          />
        )}

        {showFullReflection && state && (
          <ReflectionResult
            state={state}
            privateSession={prefs.privateSession}
            onClear={clearSession}
            onRetry={(dir) => { void runReflection(transcriptRef.current || transcript, dir) }}
          />
        )}
      </div>
    </div>
  )
}
