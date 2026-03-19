'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
import VoiceCapturePanel from './VoiceCapturePanel'
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
  const [listening, setListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<MirrorState | null>(null)

  const sessionRef = useRef<SpeechSessionController | null>(null)
  const transcriptRef = useRef('')
  const confidenceRef = useRef<number | undefined>(undefined)
  const errorRef = useRef<string | null>(null)

  useEffect(() => {
    setPrefs(getPrefs())
    setSupported(isSpeechRecognitionSupported())
  }, [])

  const finalizeState = useCallback((nextState: MirrorState) => {
    setState(nextState)

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
  }, [finalizeState, prefs.localOnly, prefs.useAI])

  const stopListening = useCallback(() => {
    sessionRef.current?.stop()
  }, [])

  const clearSession = useCallback(() => {
    sessionRef.current?.abort()
    sessionRef.current = null
    transcriptRef.current = ''
    confidenceRef.current = undefined
    errorRef.current = null
    setListening(false)
    setLoading(false)
    setTranscript('')
    setInterimTranscript('')
    setState(null)
    setError(null)
  }, [])

  const startListening = useCallback(() => {
    if (!supported || listening || loading) return

    sessionRef.current?.abort()
    transcriptRef.current = ''
    confidenceRef.current = undefined
    errorRef.current = null
    setTranscript('')
    setInterimTranscript('')
    setState(null)
    setError(null)

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
          setError('I did not catch anything. Try again or type instead.')
        }
      },
    })

    sessionRef.current = session
    session.start()
  }, [listening, loading, runReflection, supported])

  useEffect(() => {
    return () => {
      sessionRef.current?.abort()
    }
  }, [])

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
          processing={listening || loading}
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

        {transcript && (
          <section className={styles.transcriptCard}>
            <div className={`t-label ${styles.transcriptLabel}`}>Captured</div>
            <p className={`t-body ${styles.transcriptText}`}>{transcript}</p>
            {typeof confidenceRef.current === 'number' && (
              <p className={`t-small ${styles.transcriptMeta}`}>
                Confidence {Math.round(confidenceRef.current * 100)}%
              </p>
            )}
          </section>
        )}

        {state && (
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
