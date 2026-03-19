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

export default function ReflectionResult({ state, onClear, onRetry, privateSession = false }: Props) {
  const [helped, setHelped] = useState<boolean | null>(null)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const seenText = useMemo(
    () => (state.seen ?? state.distortionType ?? '').trim(),
    [state.seen, state.distortionType],
  )
  const distortionText = useMemo(
    () => (state.distortion ?? state.distortionType ?? '').trim(),
    [state.distortion, state.distortionType],
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

  return (
    <div className={styles.result}>
      <div className={styles.metaRow}>
        <span className={`mtag pattern`}>{state.primaryPattern}</span>
        {state.secondaryPattern && <span className="mtag">{state.secondaryPattern}</span>}
        <span className={`mtag ${timeClass[state.timeOrientation] ?? ''}`}>{state.timeOrientation}</span>
        {state.bodyLocation && <span className="mtag">{state.bodyLocation}</span>}
        <div className="ibar">
          <div className="ifill" style={{ width: `${Math.round(state.intensity * 100)}%` }} />
        </div>
        <span className="mtag source">{state.source}</span>
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
