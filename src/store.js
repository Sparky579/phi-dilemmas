import { useCallback, useEffect, useState } from 'react'

const KEY = 'phi-ledger-v1'
const blank = { choices: {}, extra: {}, prefs: { theme: 'auto', size: 18 } }

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return blank
    const v = JSON.parse(raw)
    return { ...blank, ...v, prefs: { ...blank.prefs, ...(v.prefs || {}) } }
  } catch {
    return blank
  }
}

export function useStore() {
  const [s, set] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch {
      /* 隐私模式下存不了，就只活在这一页里 */
    }
  }, [s])

  const choose = useCallback((id, key) => set((p) => ({ ...p, choices: { ...p.choices, [id]: key } })), [])
  const unchoose = useCallback(
    (id) =>
      set((p) => {
        const c = { ...p.choices }
        delete c[id]
        return { ...p, choices: c }
      }),
    [],
  )
  const setExtra = useCallback((k, v) => set((p) => ({ ...p, extra: { ...p.extra, [k]: v } })), [])
  const setPrefs = useCallback((o) => set((p) => ({ ...p, prefs: { ...p.prefs, ...o } })), [])
  const reset = useCallback(() => set((p) => ({ ...blank, prefs: p.prefs })), [])

  return { ...s, choose, unchoose, setExtra, setPrefs, reset }
}
