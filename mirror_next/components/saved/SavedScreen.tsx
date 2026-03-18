'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import type { LogEntry } from '@/lib/mirror/storage/historyStore'
import { getSaved, unsaveReflection } from '@/lib/mirror/storage/historyStore'
import { getPatternFrequency, getEffectivePhrases } from '@/lib/mirror/personalization/phraseMemory'
import styles from './SavedScreen.module.css'

type Tab = 'shifts' | 'patterns' | 'effective'

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

  const handleRemove = (id: string) => {
    unsaveReflection(id)
    setSaved(prev => prev.filter(s => s.id !== id))
  }

  const headerRight = <Link href="/mirror" className="btn">← Mirror</Link>

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
            {t === 'shifts' ? 'Saved shifts' : t === 'patterns' ? 'Patterns' : 'What helped'}
          </button>
        ))}
      </div>

      {/* Saved shifts */}
      {tab === 'shifts' && (
        <div className={`${styles.panel} fade-in`}>
          {saved.length === 0 ? (
            <p className={`t-prompt ${styles.empty}`}>No saved shifts yet.</p>
          ) : (
            saved.map(s => (
              <div key={s.id} className={styles.shiftItem}>
                <div>
                  <p className={`t-shift ${styles.shiftPhrase}`}>{s.shiftPhrase}</p>
                  <p className={`t-small ${styles.shiftMeta}`}>
                    {s.primaryPattern} · {new Date(s.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <button className={styles.removeBtn} onClick={() => handleRemove(s.id)} aria-label="Remove">×</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Patterns */}
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

      {/* What helped */}
      {tab === 'effective' && (
        <div className={`${styles.panel} fade-in`}>
          {phrases.length === 0 ? (
            <p className={`t-prompt ${styles.empty}`}>Mark reflections as "helped" to track effective phrases.</p>
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
