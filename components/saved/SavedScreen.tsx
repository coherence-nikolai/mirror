'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import type { LogEntry } from '@/lib/mirror/storage/historyStore'
import { getSaved, unsaveReflection } from '@/lib/mirror/storage/historyStore'
import { getPatternFrequency, getEffectivePhrases } from '@/lib/mirror/personalization/phraseMemory'
import styles from './SavedScreen.module.css'

type Tab = 'shifts' | 'patterns' | 'effective'

function formatSavedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getEntryTitle(entry: LogEntry) {
  const raw = (entry.rawInput ?? '').trim()
  if (raw) return raw
  const seen = (entry.seen ?? '').trim()
  if (seen) return seen
  return 'Saved reflection'
}

export default function SavedScreen() {
  const [tab,      setTab]      = useState<Tab>('shifts')
  const [saved,    setSaved]    = useState<LogEntry[]>([])
  const [patterns, setPatterns] = useState<Array<{ pattern: string; count: number }>>([])
  const [phrases,  setPhrases]  = useState<Array<{ phrase: string; helpedCount: number }>>([])

  useEffect(() => {
    setSaved(getSaved())
    setPatterns(getPatternFrequency().slice(0, 8))
    setPhrases(getEffectivePhrases())
  }, [])

  const savedCountLabel = useMemo(
    () => `${saved.length} ${saved.length === 1 ? 'saved reflection' : 'saved reflections'}`,
    [saved.length],
  )

  const handleRemove = (id: string) => {
    unsaveReflection(id)
    setSaved(prev => prev.filter(s => s.id !== id))
  }

  const headerRight = <Link href="/mirror" className="btn">Mirror</Link>

  return (
    <div className="shell">
      <Header rightSlot={headerRight} />

      <div className={styles.tabNav}>
        {(['shifts', 'patterns', 'effective'] as Tab[]).map(t => (
          <button
            key={t}
            className={`${styles.tabBtn} ${tab === t ? styles.active : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'shifts' ? 'Saved' : t === 'patterns' ? 'Patterns' : 'Helped'}
          </button>
        ))}
      </div>

      {tab === 'shifts' && (
        <div className={`${styles.panel} fade-in`}>
          <p className={`t-small ${styles.listMeta}`}>{savedCountLabel}</p>

          {saved.length === 0 ? (
            <p className={`t-prompt ${styles.empty}`}>No saved reflections yet.</p>
          ) : (
            <div className={styles.savedList}>
              {saved.map(s => (
                <div key={s.id} className={styles.savedItem}>
                  <Link href={`/saved/${s.id}`} className={styles.savedLink}>
                    <div className={`t-label ${styles.savedLabel}`}>Entry</div>
                    <p className={`t-body ${styles.savedInput}`}>{getEntryTitle(s)}</p>

                    <div className={`t-label ${styles.savedLabel}`}>Shift</div>
                    <p className={`t-shift ${styles.shiftPhrase}`}>{s.shiftPhrase}</p>

                    <div className={`t-small ${styles.savedMeta}`}>
                      <span>{s.primaryPattern}</span>
                      <span>·</span>
                      <span>{formatSavedDate(s.createdAt)}</span>
                    </div>
                  </Link>

                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(s.id)}
                    aria-label="Remove saved reflection"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'patterns' && (
        <div className={`${styles.panel} fade-in`}>
          {patterns.length === 0 ? (
            <p className={`t-prompt ${styles.empty}`}>Patterns appear after a few reflections.</p>
          ) : (
            <div className={styles.patternGrid}>
              {patterns.map(({ pattern, count }) => (
                <div key={pattern} className={styles.patternCard}>
                  <div className={`t-label ${styles.patternName}`}>{pattern}</div>
                  <div className={styles.patternCount}>{count}</div>
                  <div className={styles.patternBar}>
                    <div
                      className={styles.patternFill}
                      style={{ width: `${Math.round(count / patterns[0].count * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'effective' && (
        <div className={`${styles.panel} fade-in`}>
          {phrases.length === 0 ? (
            <p className={`t-prompt ${styles.empty}`}>Mark reflections as helped to track what lands.</p>
          ) : (
            phrases.map(({ phrase, helpedCount }) => (
              <div key={phrase} className={styles.effectiveItem}>
                <p className={`t-shift ${styles.effectivePhrase}`}>{phrase}</p>
                <span className={`t-small ${styles.effectiveCount}`}>{helpedCount}×</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
