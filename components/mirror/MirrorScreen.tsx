'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Orb from '@/components/orb/Orb'
import Header from '@/components/layout/Header'
import ReflectionResult from './ReflectionResult'
import type { MirrorState, ToneStyle } from '@/lib/mirror/types'
import { logReflection } from '@/lib/mirror/storage/historyStore'
import { getTonePrefs, recordPattern } from '@/lib/mirror/personalization/phraseMemory'
import { shouldTriggerReturnMode } from '@/lib/mirror/constants'
import { getPrefs, type MirrorPrefs, DEFAULT_PREFS, setTempReturnState } from '@/lib/mirror/storage/prefsStore'
import { reflectLocal } from '@/lib/mirror/engine/reflectLocal'
import styles from './MirrorScreen.module.css'

const EXAMPLE_PROMPTS = [
  'I feel like everything is too much right now…',
  "I can't make myself start anything.",
  'Something heavy is sitting in my chest.',
  "I don't know what I feel, just that something is off.",
  "I keep going over what happened and I can't let it go.",
  'I feel completely numb and disconnected.',
]

function retryToTone(direction?: 'softer' | 'direct' | null): ToneStyle | undefined {
  if (direction === 'softer') return 'soft'
  if (direction === 'direct') return 'direct'
  const preferred = getTonePrefs().preferred
  return preferred === 'clean' ? undefined : preferred
}

export default function MirrorScreen() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [state, setState] = useState<MirrorState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<MirrorPrefs>(DEFAULT_PREFS)
  const [promptIdx, setPromptIdx] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setPrefs(getPrefs())
  }, [])

  const charCount = input.length
  const canSubmit = input.trim().length >= 3 && !loading

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

  const handleSubmit = useCallback(async (retryDirection?: 'softer' | 'direct') => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    setState(null)

    const tonePreference = retryToTone(retryDirection)

    try {
      if (prefs.localOnly) {
        const localState = reflectLocal({ rawInput: input.trim(), tonePreference })
        finalizeState(localState)
        return
      }

      const res = await fetch('/api/mirror/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: input.trim(),
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
        const localState = reflectLocal({ rawInput: input.trim(), tonePreference })
        finalizeState(localState)
      } else {
        setError('Network error — please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [canSubmit, finalizeState, input, prefs.localOnly, prefs.useAI])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const handleClear = () => {
    setInput('')
    setState(null)
    setError(null)
    textareaRef.current?.focus()
  }

  const cyclePrompt = () => setPromptIdx(i => (i + 1) % EXAMPLE_PROMPTS.length)

  const headerRight = (
    <>
      <Link href="/voice" className="btn">Voice</Link>
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
          processing={loading}
          reducedMotion={prefs.reducedMotion}
        />
      </div>

      {!state && (
        <div className={`${styles.inputSection} fade-in`}>
          <label className={`t-label ${styles.fieldLabel}`} htmlFor="mirror-input">
            What is present right now
          </label>
          <textarea
            id="mirror-input"
            ref={textareaRef}
            className={styles.textarea}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={EXAMPLE_PROMPTS[promptIdx]}
            maxLength={1000}
            rows={4}
            autoFocus
          />
          <div className={styles.inputFoot}>
            <button className={`${styles.promptHint} t-small`} onClick={cyclePrompt} type="button" tabIndex={-1}>↻</button>
            <span className={`t-small ${styles.charCount}`}>{charCount} / 1000</span>
            <button className="btn accent" onClick={() => handleSubmit()} disabled={!canSubmit}>
              {loading ? 'Listening…' : 'Reflect'}
            </button>
          </div>
          {loading && (
            <div className={styles.loadingRow}>
              <span className={styles.dot} />
              <span className={styles.dot} style={{ animationDelay: '180ms' }} />
              <span className={styles.dot} style={{ animationDelay: '360ms' }} />
            </div>
          )}
        </div>
      )}

      {error && !state && <div className={`${styles.error} fade-in`}>{error}</div>}

      {state && (
        <ReflectionResult
          state={state}
          privateSession={prefs.privateSession}
          onClear={handleClear}
          onRetry={(dir) => { void handleSubmit(dir) }}
        />
      )}
    </div>
  )
}
