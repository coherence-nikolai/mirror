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

  const stateLabel = reflecting
    ? 'Reflecting'
    : listening
      ? 'Listening'
      : hasPreview
        ? 'Heard'
        : 'Voice'

  const caption = reflecting
    ? 'Working from what I heard.'
    : listening
      ? 'Speak one state clearly. Short is better.'
      : 'Tap once. Speak one state clearly.'

  return (
    <section className={styles.panel}>
      <div className="t-label" style={{ marginBottom: '12px', display: 'block' }}>
        {stateLabel}
      </div>

      {!supported ? (
        <div className={styles.messageBlock}>
          <p className="t-body">Voice capture isn’t supported here.</p>
          <p className={`t-small ${styles.supportLine}`}>Try Safari, or use text instead.</p>
          <div className={styles.actions}>
            <Link href="/mirror" className="btn accent">Type instead</Link>
          </div>
        </div>
      ) : (
        <>
          <p className={`t-small ${styles.caption}`}>{caption}</p>

          {!listening && !reflecting && !hasPreview && (
            <p className={`t-small ${styles.supportLine}`}>When you finish, tap Stop.</p>
          )}

          {hasPreview && (
            <div className={styles.preview}>
              <div className={`t-label ${styles.previewLabel}`}>Heard</div>
              <p className={`t-body ${styles.previewText}`}>{preview}</p>
              <p className={`t-small ${styles.previewHelp}`}>Check that this matches what you said.</p>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            {!listening ? (
              <button className="btn accent" type="button" onClick={onStart} disabled={reflecting}>
                {hasPreview ? 'Listen again' : 'Start voice'}
              </button>
            ) : (
              <button className="btn accent" type="button" onClick={onStop}>
                Stop
              </button>
            )}

            {!listening && hasPreview && (
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
