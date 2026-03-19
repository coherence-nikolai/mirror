'use client'

import Link from 'next/link'
import styles from './VoiceCapturePanel.module.css'

type Props = {
  supported: boolean
  listening: boolean
  reflecting: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  onStart: () => void
  onStop: () => void
  onRetry: () => void
}

export default function VoiceCapturePanel({
  supported,
  listening,
  reflecting,
  transcript,
  interimTranscript,
  error,
  onStart,
  onStop,
  onRetry,
}: Props) {
  const preview = [transcript, interimTranscript].filter(Boolean).join(' ').trim()
  const hasPreview = preview.length > 0

  return (
    <section className={styles.panel}>
      <div className="t-label" style={{ marginBottom: '12px', display: 'block' }}>
        Voice
      </div>

      {!supported ? (
        <div className={styles.messageBlock}>
          <p className="t-body">Voice capture is not available here.</p>
          <div className={styles.actions}>
            <Link href="/mirror" className="btn accent">Type instead</Link>
          </div>
        </div>
      ) : (
        <>
          <p className={`t-small ${styles.caption}`}>
            {listening ? 'Speak one state clearly.' : reflecting ? 'Reflecting from transcript…' : 'Tap once. Speak one state clearly.'}
          </p>

          {hasPreview && (
            <div className={styles.preview}>
              <div className={`t-label ${styles.previewLabel}`}>Transcript</div>
              <p className={`t-body ${styles.previewText}`}>{preview}</p>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            {!listening ? (
              <button className="btn accent" type="button" onClick={onStart} disabled={reflecting}>
                {transcript ? 'Listen again' : 'Start voice'}
              </button>
            ) : (
              <button className="btn accent" type="button" onClick={onStop}>
                Stop
              </button>
            )}

            {!listening && transcript && (
              <button className="btn" type="button" onClick={onRetry} disabled={reflecting}>
                Try again
              </button>
            )}

            <Link href="/mirror" className="btn">Type instead</Link>
          </div>
        </>
      )}
    </section>
  )
}
