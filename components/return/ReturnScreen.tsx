'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Orb from '@/components/orb/Orb'
import type { MirrorState } from '@/lib/mirror/types'
import { getLog } from '@/lib/mirror/storage/historyStore'
import { BREATH_PROFILES, VISUAL_PROFILES } from '@/lib/mirror/constants'
import { getPrefs, getTempReturnState } from '@/lib/mirror/storage/prefsStore'
import styles from './ReturnScreen.module.css'

const CRISIS_LINES = [
  { region: 'AU', label: 'Lifeline', contact: '13 11 14' },
  { region: 'US', label: 'Crisis Text Line', contact: 'Text HOME to 741741' },
  { region: 'UK', label: 'Samaritans', contact: '116 123' },
  { region: 'NZ', label: 'Lifeline', contact: '0800 543 354' },
]

export default function ReturnScreen() {
  const params = useSearchParams()
  const id = params.get('id')
  const [state, setState] = useState<MirrorState | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(getPrefs().reducedMotion)
  }, [])

  useEffect(() => {
    const log = getLog()
    const loggedEntry = id ? log.find(e => e.id === id) : null
    if (loggedEntry) {
      setState(loggedEntry)
      return
    }

    const temp = getTempReturnState()
    if (temp && (!id || temp.id === id)) {
      setState(temp)
    }
  }, [id])

  const isRed = state?.safetyTier === 'red'
  const bp = state ? (BREATH_PROFILES[state.primaryPattern] ?? BREATH_PROFILES.default) : BREATH_PROFILES.default
  const vs = state ? (VISUAL_PROFILES[state.primaryPattern] ?? VISUAL_PROFILES.default) : VISUAL_PROFILES.default

  const redVisual = isRed ? {
    ...vs,
    pulseSpeed: 9.0,
    glowStrength: 0.25,
    contraction: 0.20,
    grain: 0.12,
  } : vs

  return (
    <div className={`shell return-mode ${styles.screen}`}>
      <div className={styles.topBar}>
        <span className="t-logo">Mirror</span>
        <Link href="/mirror" className="btn">Back</Link>
      </div>

      <div className={styles.orbArea}>
        <Orb visualState={redVisual} breathProfile={bp} reducedMotion={reducedMotion} />
      </div>

      {state ? (
        <div className={styles.content}>
          <div className={`${styles.shiftArea} emerge`}>
            <div className="t-label" style={{ marginBottom: '12px', display: 'block' }}>
              Return
            </div>
            <p className={`t-shift ${styles.shift}`}>{state.shiftPhrase}</p>
          </div>

          {state.microPractice && (
            <div className={`${styles.practiceArea} emerge-1`}>
              <p className={`t-body ${styles.practice}`}>{state.microPractice}</p>
            </div>
          )}

          {(state.seen ?? state.distortion ?? state.distortionType) && (
            <div className={`${styles.seenArea} emerge-2`}>
              <p className={`t-small ${styles.seen}`}>{state.seen ?? state.distortion ?? state.distortionType}</p>
            </div>
          )}

          {isRed && (
            <div className={`${styles.supportArea} emerge-3`}>
              <p className={`t-label ${styles.supportLabel}`}>Support is available</p>
              <div className={styles.supportLines}>
                {CRISIS_LINES.map(line => (
                  <div key={line.region} className={styles.supportLine}>
                    <strong>{line.region}</strong>
                    <span>{line.label} — {line.contact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.safetyTier === 'amber' && !isRed && (
            <div className={`${styles.ambernote} emerge-3`}>
              <p className="t-small">If things feel heavier than usual, support is available when you need it.</p>
            </div>
          )}

          <div className={`${styles.actions} emerge-4`}>
            <Link href="/mirror" className="btn accent">New reflection</Link>
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          <div className="t-label" style={{ marginBottom: '12px', display: 'block' }}>
            Return
          </div>
          <p className="t-prompt">Take a breath.</p>
          <p className="t-small" style={{ marginTop: '16px', textAlign: 'center' }}>
            Return mode. Fewer words. Stronger ground.
          </p>
          <div style={{ marginTop: '32px' }}>
            <Link href="/mirror" className="btn accent">Begin</Link>
          </div>
        </div>
      )}
    </div>
  )
}
