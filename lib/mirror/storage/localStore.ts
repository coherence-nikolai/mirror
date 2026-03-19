'use client'

// Safe JSON read/write — never throws
export function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function lsSet<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function lsDel(key: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(key) } catch {}
}

export function lsClear(prefix?: string): void {
  if (typeof window === 'undefined') return
  if (!prefix) { localStorage.clear(); return }
  const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix))
  keys.forEach(k => localStorage.removeItem(k))
}
