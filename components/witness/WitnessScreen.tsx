'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Orb from '@/components/orb/Orb'
import type { MirrorState } from '@/lib/mirror/types'
import { reflectLocal } from '@/lib/mirror/engine/reflectLocal'
import { DEFAULT_PREFS, getPrefs, type MirrorPrefs } from '@/lib/mirror/storage/prefsStore'
import { formatWitnessResponse, type WitnessResponse } from '@/lib/witness/formatWitnessResponse'
import styles from './WitnessScreen.module.css'

const EXAMPLES = [
  'I feel weird.',
  'I do not know what this is yet.',
  'Part of me wants this, part of me does not.',
  'I feel vulnerable.',
  'Something is changing but not clear yet.',
]

export default function WitnessScreen() {
  const [prefs] = useState<MirrorPrefs>(getPrefs?.() ?? DEFAULT_PREFS)
  const [input, setInput] = useState('')
  const [state, setState] = useState<MirrorState | null>(null)
  const [loading, setLoading] = useState(false)
  const [exampleIdx, setExampleIdx] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const response: WitnessResponse | null = useMemo(
    () => (state ? formatWitnessResponse(state) : null),
    [state]
  )

  const canSubmit = input.trim().length >= 3 && !loading

  const handleWitness = () => {
    if (!canSubmit) return
    setLoading(true)

    const nextState = reflectLocal({ rawInput: input.trim(), tonePreference: 'soft' })
    setState(nextState)
    setLoading(false)
  }

  const handleAgain = () => {
    setInput('')
    setState(null)
    textareaRef.current?.focus()
  }

  const cycleExample = () => setExampleIdx(i => (i + 1) % EXAMPLES.length)

  const headerRight = (
    <>
      <Link href="/mirror" className="btn">Mirror</Link>
      <Link href="/breath" className="btn">Breath</Link>
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

      {!response && (
        <div className={`${styles.inputSection} fade-in`}>
          <label className={`t-label ${styles.fieldLabel}`} htmlFor="witness-input">
            What is here, without trying to fix it
          </label>
          <textarea
            id="witness-input"
            ref={textareaRef}
            className={styles.textarea}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={EXAMPLES[exampleIdx]}
            rows={4}
            maxLength={500}
            autoFocus
          />
          <div className={styles.inputFoot}>
            <button className={`${styles.promptHint} t-small`} onClick={cycleExample} type="button" tabIndex={-1}>↻</button>
            <span className={`t-small ${styles.charCount}`}>{input.length} / 500</span>
            <button className="btn accent" onClick={handleWitness} disabled={!canSubmit}>
              {loading ? 'Holding…' : 'Witness'}
            </button>
          </div>
        </div>
      )}

      {response && (
        <div className={`${styles.resultCard} fade-in`}>
          <div className={styles.block}>
            <div className={styles.blockLabel}>Seen</div>
            <p className={`t-body ${styles.bodyText}`}>{response.seen}</p>
          </div>

          <div className={styles.block}>
            <div className={styles.blockLabel}>Permission</div>
            <p className={`t-body ${styles.bodyText}`}>{response.permission}</p>
          </div>

          <div className={styles.block}>
            <div className={styles.blockLabel}>Witness line</div>
            <p className={`t-shift ${styles.shiftText}`}>{response.witnessLine}</p>
          </div>

          <div className={styles.actions}>
            <button className="btn accent" type="button" onClick={handleAgain}>Again</button>
            <Link href="/mirror" className="btn">Return</Link>
          </div>
        </div>
      )}
    </div>
  )
}
