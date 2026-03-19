'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { exportAll, deleteAll } from '@/lib/mirror/storage/historyStore'
import { getPrefs, setPrefs, type MirrorPrefs, DEFAULT_PREFS } from '@/lib/mirror/storage/prefsStore'
import styles from './SettingsScreen.module.css'

export default function SettingsScreen() {
  const [prefs, setPrefsState] = useState<MirrorPrefs>(DEFAULT_PREFS)
  const [deleted, setDeleted] = useState(false)
  const [exported, setExported] = useState(false)

  useEffect(() => {
    setPrefsState(getPrefs())
  }, [])

  const update = (key: keyof MirrorPrefs, val: boolean) => {
    setPrefsState(prev => {
      const next = { ...prev, [key]: val }
      setPrefs(next)
      return next
    })
  }

  const updateMany = (changes: Partial<MirrorPrefs>) => {
    setPrefsState(prev => {
      const next = { ...prev, ...changes }
      setPrefs(next)
      return next
    })
  }

  const handleExport = () => {
    const data = exportAll()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mirror-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  const handleDeleteAll = () => {
    if (!confirm('Delete all Mirror data on this device? This cannot be undone.')) return
    deleteAll()
    setPrefsState(DEFAULT_PREFS)
    setDeleted(true)
  }

  const headerRight = <Link href="/mirror" className="btn">← Mirror</Link>

  return (
    <div className="shell">
      <Header rightSlot={headerRight} />

      <div className={styles.page}>
        <section className={styles.section}>
          <h2 className={`t-label ${styles.sectionTitle}`}>Privacy</h2>
          <div className={styles.trustCard}>
            <p className="t-small">Mirror reflects patterns. It does not diagnose.</p>
            <p className="t-small">Reflections are stored on this device only by default.</p>
            <p className="t-small">AI is optional and can be turned off below.</p>
            <p className="t-small">You can export or delete everything at any time.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={`t-label ${styles.sectionTitle}`}>Controls</h2>

          <div className={styles.toggleList}>
            <Toggle
              label="AI reflection"
              description="Uses the server reflection path when enabled. Local-only mode turns this off."
              value={prefs.useAI}
              onChange={v => {
                if (v && prefs.localOnly) {
                  updateMany({ localOnly: false, useAI: true })
                  return
                }
                update('useAI', v)
              }}
            />
            <Toggle
              label="Local only"
              description="When on, reflection stays on this device and AI is disabled."
              value={prefs.localOnly}
              onChange={v => {
                if (v) {
                  updateMany({ localOnly: true, useAI: false })
                  return
                }
                update('localOnly', false)
              }}
            />
            <Toggle
              label="Private session"
              description="Reflections are not written to history during this session."
              value={prefs.privateSession}
              onChange={v => update('privateSession', v)}
            />
            <Toggle
              label="Reduced motion"
              description="Disables orb breathing animation and reduces visual motion."
              value={prefs.reducedMotion}
              onChange={v => update('reducedMotion', v)}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={`t-label ${styles.sectionTitle}`}>Your data</h2>
          <div className={styles.dataActions}>
            <button className="btn accent" onClick={handleExport}>
              {exported ? 'Exported' : 'Export all reflections'}
            </button>
            <button className={`btn ${styles.deleteBtn}`} onClick={handleDeleteAll} disabled={deleted}>
              {deleted ? 'Deleted' : 'Delete all reflections'}
            </button>
          </div>
          {deleted && <p className={`t-small ${styles.deleteNote}`}>All Mirror data was deleted from this device.</p>}
        </section>

        <div className={styles.version}>
          <span className="t-small">Mirror v3 · coherence suite</span>
        </div>
      </div>
    </div>
  )
}

function Toggle({
  label, description, value, onChange,
}: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={styles.toggle}>
      <div className={styles.toggleText}>
        <span className={styles.toggleLabel}>{label}</span>
        <span className={`t-small ${styles.toggleDesc}`}>{description}</span>
      </div>
      <button
        role="switch"
        aria-checked={value}
        className={`${styles.toggleBtn} ${value ? styles.on : ''}`}
        onClick={() => onChange(!value)}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  )
}
