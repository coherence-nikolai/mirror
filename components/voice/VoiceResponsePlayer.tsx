'use client'

import type { VoiceSpokenResponse } from '@/lib/voice/formatSpokenResponse'
import styles from './VoiceResponsePlayer.module.css'

type Props = {
  response: VoiceSpokenResponse
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
  speechSupported,
  speaking,
  onReplay,
  onStop,
  onOpenReflection,
  onReturn,
  onAgain,
}: Props) {
  return (
    <section className={styles.card}>
      <div className="t-label" style={{ marginBottom: '12px', display: 'block' }}>
        Spoken
      </div>

      <div className={styles.lines}>
        <p className={`t-body ${styles.seen}`}>{response.seenLine}</p>
        <p className={`t-shift ${styles.shift}`}>{response.shiftLine}</p>
        {response.paceLine && <p className={`t-micro ${styles.pace}`}>{response.paceLine}</p>}
      </div>

      <div className={styles.actions}>
        {speechSupported ? (
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
        ) : (
          <span className={`t-small ${styles.supportNote}`}>On-screen response only.</span>
        )}

        <button className="btn" type="button" onClick={onOpenReflection}>
          Open reflection
        </button>
        <button className="btn" type="button" onClick={onReturn}>
          Return
        </button>
        <button className="btn" type="button" onClick={onAgain}>
          Again
        </button>
      </div>
    </section>
  )
}
