'use client'

import { useMemo, useState } from 'react'
import type { MirrorState } from '@/lib/mirror/types'
import { markHelped, saveReflection } from '@/lib/mirror/storage/historyStore'
import { recordPhrase, recordRetry } from '@/lib/mirror/personalization/phraseMemory'
import styles from './ReflectionResult.module.css'

type Props = {
  state: MirrorState
  onClear: () => void
  onRetry: (direction: 'softer' | 'direct') => void
  privateSession?: boolean
}

const VAGUE_VALUES = new Set(['', 'unresolved', 'unsettled'])

function humanizePatternLabel(pattern: string | undefined): string {
  if (!pattern) return ''
  return pattern === 'unresolved' ? 'unsettled' : pattern
}

function titleCaseEmotion(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function extractNamedEmotion(rawInput: string): string | null {
  const lower = rawInput.toLowerCase()

  const emotionMap: Array<[RegExp, string]> = [
    [/(^|\b)(sad|sadness)(\b|$)/, 'sadness'],
    [/(^|\b)(anxious|anxiety)(\b|$)/, 'anxiety'],
    [/(^|\b)(overwhelmed|overwhelm)(\b|$)/, 'overwhelm'],
    [/(^|\b)(angry|anger|mad)(\b|$)/, 'anger'],
    [/(^|\b)(afraid|fearful|scared|fear)(\b|$)/, 'fear'],
    [/(^|\b)(lonely|alone|isolation)(\b|$)/, 'loneliness'],
    [/(^|\b)(grief|grieving|grief-stricken)(\b|$)/, 'grief'],
    [/(^|\b)(tired|exhausted|drained|burnt out|burned out)(\b|$)/, 'exhaustion'],
    [/(^|\b)(confused|confusion|uncertain)(\b|$)/, 'confusion'],
  ]

  for (const [pattern, label] of emotionMap) {
    if (pattern.test(lower)) return label
  }

  return null
}

function isLowConfidence(state: MirrorState): boolean {
  return state.primaryPattern === 'unresolved' || state.confidence < 0.5
}

function buildSeenText(state: MirrorState): string {
  const candidate = (state.seen ?? state.distortionType ?? '').trim()
  const namedEmotion = extractNamedEmotion(state.rawInput)

  if (!isLowConfidence(state) && !VAGUE_VALUES.has(candidate.toLowerCase())) {
    return candidate
  }

  if (namedEmotion) {
    return `${titleCaseEmotion(namedEmotion)} is here.`
  }

  return 'Something difficult is here.'
}

function buildDistortionText(state: MirrorState, resolvedSeenText: string): string {
  const candidate = (state.distortion ?? state.distortionType ?? '').trim()
  const normalized = candidate.toLowerCase()

  if (!isLowConfidence(state) && !VAGUE_VALUES.has(normalized) && normalized !== resolvedSeenText.toLowerCase()) {
    return candidate
  }

  if (normalized && normalized !== resolvedSeenText.toLowerCase() && normalized !== 'unresolved') {
    return candidate
  }

  return 'The feeling may be narrowing the view.'
}

export default function ReflectionResult({ state, onClear, onRetry, privateSession = false }: Props) {
  const [helped, setHelped] = useState<boolean | null>(null)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const seenText = useMemo(
    () => buildSeenText(state),
    [state],
  )
  const distortionText = useMemo(
    () => buildDistortionText(state, seenText),
    [state, seenText],
  )

  const handleHelped = (val: boolean) => {
    setHelped(val)
    if (privateSession) return
    markHelped(state.id, val)
    recordPhrase(state.shiftPhrase, state.primaryPattern, val)
  }

  const handleSave = () => {
    saveReflection(state)
    setSaved(true)
  }

  const handleCopy = () => {
    const sections = [
      seenText ? `Seen
${seenText}` : '',
      distortionText ? `Distortion
${distortionText}` : '',
      state.shiftPhrase ? `Shift
${state.shiftPhrase}` : '',
      state.microPractice || '',
      state.nextStep || '',
    ].filter(Boolean)

    navigator.clipboard.writeText(sections.join('\n\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleRetry = (dir: 'softer' | 'direct') => {
    if (!privateSession) recordRetry(dir)
    onRetry(dir)
  }

  const timeClass: Record<string, string> = {
    past: 't-past', present: 't-present', future: 't-future', mixed: 't-mixed',
  }

  const sourceLabel: Record<string, string> = {
    deterministic: 'Local',
    ai: 'AI',
    hybrid: 'Hybrid',
    repaired: 'Repaired',
  }

  return (
    <div className={styles.result}>
      <div className="t-label" style={{ marginBottom: '12px', display: 'block' }}>
        Reflection
      </div>

      <div className={styles.metaRow}>
        <span className={`mtag pattern`}>{humanizePatternLabel(state.primaryPattern)}</span>
        {state.secondaryPattern && <span className="mtag">{humanizePatternLabel(state.secondaryPattern)}</span>}
        <span className={`mtag ${timeClass[state.timeOrientation] ?? ''}`}>{state.timeOrientation}</span>
        {state.bodyLocation && <span className="mtag">{state.bodyLocation}</span>}
        <div className="ibar">
          <div className="ifill" style={{ width: `${Math.round(state.intensity * 100)}%` }} />
        </div>
        <span className="mtag source">{sourceLabel[state.source] ?? state.source}</span>
      </div>

      <div className={`${styles.block} ${styles.seenBlock} emerge-1`}>
        <div className={styles.blockLabel}>Seen</div>
        <p className={`t-body ${styles.blockText}`}>{seenText}</p>
      </div>

      <div className={`${styles.block} ${styles.distBlock} emerge-2`}>
        <div className={styles.blockLabel}>Distortion</div>
        <p className={`t-body ${styles.blockText}`}>{distortionText}</p>
      </div>

      <div className={`${styles.block} ${styles.shiftBlock} emerge-3`}>
        <div className={styles.blockLabel}>Shift</div>
        <p className={`t-shift ${styles.shiftText}`}>{state.shiftPhrase}</p>
        {state.microPractice && <p className={`t-micro ${styles.microLine}`}>{state.microPractice}</p>}
      </div>

      {state.nextStep && (
        <div className={`${styles.block} ${styles.actionBlock} emerge-4`}>
          <div className={styles.blockLabel}>Next step</div>
          <p className={`t-body ${styles.blockText}`}>{state.nextStep}</p>
        </div>
      )}

      <div className={`${styles.helpedRow} emerge-4`}>
        <span className={`t-label ${styles.helpedLabel}`}>Did this help?</span>
        <button className={`btn ${helped === true ? styles.helpedYes : ''}`} onClick={() => handleHelped(true)}>Yes</button>
        <button className={`btn ${helped === false ? styles.helpedNo : ''}`} onClick={() => handleHelped(false)}>No</button>
      </div>

      <div className={styles.actions}>
        <button className={`btn ${copied ? 'flash' : ''}`} onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button className={`btn ${saved ? 'flash' : ''}`} onClick={handleSave} disabled={saved}>
          {saved ? 'Saved' : 'Save shift'}
        </button>
        <button className="btn" onClick={() => handleRetry('softer')}>Softer</button>
        <button className="btn" onClick={() => handleRetry('direct')}>More direct</button>
        <button className="btn" onClick={onClear}>Clear</button>
      </div>
    </div>
  )
}
