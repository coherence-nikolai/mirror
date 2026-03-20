'use client'

import type { VoiceSpokenResponse } from '@/lib/voice/formatSpokenResponse'
import type { VoiceOutcomeMode } from '@/lib/voice/resolveVoiceOutcome'
import styles from './VoiceResponsePlayer.module.css'

type Props = {
  response: VoiceSpokenResponse
  mode: VoiceOutcomeMode
  speechSupported: boolean
  speaking: boolean
  onReplay: () => void
  onStop: () => void
  onOpenReflection: () => void
  onReturn: () => void
  onAgain: () => void
}

export default function VoiceResponsePlayer({
  response,
  mode,
  speechSupported,
  speaking,
  onReplay,
  onStop,
  onOpenReflection,
  onReturn,
  onAgain,
}: Props) {
  const showReplay = speechSupported && mode !== 'crisis'
  const showOpenReflection = mode !== 'crisis'
  const primaryReturnLabel = mode === 'crisis' ? 'Support' : 'Return'

  return (
    <section className={styles.card}>
      <div className="t-label" style={{ marginBottom: '12px', display: 'block' }}>
        Response
      </div>

      <div className={styles.lines}>
        <p className={`t-body ${styles.seen}`}>{response.seenLine}</p>
        <p className={`t-shift ${styles.shift}`}>{response.shiftLine}</p>
        {response.paceLine && <p className={`t-micro ${styles.pace}`}>{response.paceLine}</p>}
      </div>

      {mode === 'crisis' && (
        <p className={`t-small ${styles.supportNote}`}>Return opens support guidance.</p>
      )}

      <div className={styles.actions}>
        {showReplay ? (
          <>
            <button className="btn accent" type="button" onClick={onReplay}>
              Replay
            </button>
            {speaking && (
              <button className="btn" type="button" onClick={onStop}>
                Stop
              </button>
            )}
          </>
        ) : !speechSupported ? (
          <span className={`t-small ${styles.supportNote}`}>Response shown on screen.</span>
        ) : null}

        {showOpenReflection && (
          <button className="btn" type="button" onClick={onOpenReflection}>
            View full reflection
          </button>
        )}

        <button className={`btn ${mode === 'crisis' ? 'accent' : ''}`} type="button" onClick={onReturn}>
          {primaryReturnLabel}
        </button>

        <button className="btn" type="button" onClick={onAgain}>
          Again
        </button>
      </div>
    </section>
  )
}
