'use client'

import { lsGet, lsSet, lsDel } from './localStore'
import type { MirrorState } from '../types'
import {
  clearPhrases,
  clearPatterns,
  clearTonePrefs,
  getAllPhrases,
  getPatternFrequency,
  getTonePrefs,
} from '../personalization/phraseMemory'
import { clearPrefs, clearTempReturnState, getPrefs } from './prefsStore'

const KEYS = {
  LOG: 'mirror.log',
  SAVED: 'mirror.saved',
}

const MAX_LOG = 100
const MAX_SAVED = 40

export type LogEntry = MirrorState & {
  helped: boolean | null
  saved: boolean
}

export function logReflection(state: MirrorState): LogEntry {
  const log = lsGet<LogEntry[]>(KEYS.LOG, [])
  const entry: LogEntry = { ...state, helped: null, saved: false }
  log.unshift(entry)
  if (log.length > MAX_LOG) log.splice(MAX_LOG)
  lsSet(KEYS.LOG, log)
  return entry
}

export function getLog(): LogEntry[] {
  return lsGet<LogEntry[]>(KEYS.LOG, [])
}

export function markHelped(id: string, helped: boolean): void {
  const log = lsGet<LogEntry[]>(KEYS.LOG, [])
  const entry = log.find(x => x.id === id)
  if (entry) {
    entry.helped = helped
    lsSet(KEYS.LOG, log)
  }
}

export function clearLog(): void {
  lsDel(KEYS.LOG)
}

export function saveReflection(state: MirrorState): void {
  const saved = lsGet<LogEntry[]>(KEYS.SAVED, [])
  const exists = saved.some(s => s.id === state.id)
  if (exists) return

  const entry: LogEntry = { ...state, saved: true, helped: state.helped ?? null }
  saved.unshift(entry)
  if (saved.length > MAX_SAVED) saved.splice(MAX_SAVED)
  lsSet(KEYS.SAVED, saved)

  const log = lsGet<LogEntry[]>(KEYS.LOG, [])
  const logged = log.find(x => x.id === state.id)
  if (logged) {
    logged.saved = true
    lsSet(KEYS.LOG, log)
  }
}

export function unsaveReflection(id: string): void {
  const saved = lsGet<LogEntry[]>(KEYS.SAVED, []).filter(s => s.id !== id)
  lsSet(KEYS.SAVED, saved)
}

export function getSaved(): LogEntry[] {
  return lsGet<LogEntry[]>(KEYS.SAVED, [])
}

export function clearSaved(): void {
  lsDel(KEYS.SAVED)
}

export function exportAll(): string {
  return JSON.stringify({
    log: getLog(),
    saved: getSaved(),
    phrases: getAllPhrases(),
    patterns: getPatternFrequency(),
    tonePrefs: getTonePrefs(),
    prefs: getPrefs(),
    exportedAt: new Date().toISOString(),
  }, null, 2)
}

export function deleteAll(): void {
  clearLog()
  clearSaved()
  clearPhrases()
  clearPatterns()
  clearTonePrefs()
  clearPrefs()
  clearTempReturnState()
}
