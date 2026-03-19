'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import type { LogEntry } from '@/lib/mirror/storage/historyStore'
import { getSaved, unsaveReflection } from '@/lib/mirror/storage/historyStore'
import styles from './SavedDetail.module.css'

type Props = {
  id: string
}

function formatSavedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function buildCopyText(entry: LogEntry) {
  return [
    entry.rawInput ? `Heard\n${entry.rawInput}` : '',
    entry.seen ? `Seen\n${entry.seen}` : '',
    entry.distortion ? `Distortion\n${entry.distortion}` : '',
    entry.shiftPhrase ? `Shift\n${entry.shiftPhrase}` : '',
    entry.microPractice ? `Practice\n${entry.microPractice}` : '',
    entry.nextStep ? `Next step\n${entry.nextStep}` : '',
  ].filter(Boolean).join('\n\n')
}

export default function SavedDetail({ id }: Props) {
  const router = useRouter()
  const [entry, setEntry] = useState<LogEntry | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const match = getSaved().find(item => item.id === id) ?? null
    setEntry(match)
  }, [id])

  const copyText = useMemo(() => (entry ? buildCopyText(entry) : ''), [entry])

  const handleCopy = async () => {
    if (!copyText) return
    await navigator.clipboard.writeText(copyText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const handleDelete = () => {
    if (!entry) return
    unsaveReflection(entry.id)
    router.push('/saved')
  }

  const headerRight = (
    <>
      <Link href="/saved" className="btn">Saved</Link>
      <Link href="/mirror" className="btn">Mirror</Link>
    </>
  )

  if (!entry) {
    return (
      <div className="shell">
        <Header rightSlot={headerRight} />
        <div className={styles.emptyWrap}>
          <p className="t-prompt">This saved reflection could not be found.</p>
          <div className={styles.emptyActions}>
            <Link href="/saved" className="btn accent">Back to saved</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="shell">
      <Header rightSlot={headerRight} />

      <div className={styles.page}>
        <div className={styles.metaRow}>
          <span className="mtag pattern">{entry.primaryPattern}</span>
          {entry.timeOrientation && <span className={`mtag t-${entry.timeOrientation}`}>{entry.timeOrientation}</span>}
          <span className="mtag source">{formatSavedDate(entry.createdAt)}</span>
        </div>

        {entry.rawInput && (
          <section className={styles.block}>
            <div className={`t-label ${styles.blockLabel}`}>Heard</div>
            <p className={`t-body ${styles.bodyText}`}>{entry.rawInput}</p>
          </section>
        )}

        {entry.shiftPhrase && (
          <section className={styles.block}>
            <div className={`t-label ${styles.blockLabel}`}>Shift</div>
            <p className={`t-shift ${styles.shiftText}`}>{entry.shiftPhrase}</p>
          </section>
        )}

        {entry.seen && (
          <section className={styles.block}>
            <div className={`t-label ${styles.blockLabel}`}>Seen</div>
            <p className={`t-body ${styles.bodyText}`}>{entry.seen}</p>
          </section>
        )}

        {entry.distortion && (
          <section className={styles.block}>
            <div className={`t-label ${styles.blockLabel}`}>Distortion</div>
            <p className={`t-body ${styles.bodyText}`}>{entry.distortion}</p>
          </section>
        )}

        {entry.microPractice && (
          <section className={styles.block}>
            <div className={`t-label ${styles.blockLabel}`}>Practice</div>
            <p className={`t-micro ${styles.practiceText}`}>{entry.microPractice}</p>
          </section>
        )}

        {entry.nextStep && (
          <section className={styles.block}>
            <div className={`t-label ${styles.blockLabel}`}>Next step</div>
            <p className={`t-body ${styles.bodyText}`}>{entry.nextStep}</p>
          </section>
        )}

        <div className={styles.actions}>
          <button className={`btn ${copied ? 'flash' : ''}`} type="button" onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className="btn" type="button" onClick={handleDelete}>Delete</button>
          <Link href="/saved" className="btn">Back</Link>
        </div>
      </div>
    </div>
  )
}
