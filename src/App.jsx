import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { chapters, byId } from './content/index.js'
import { useStore } from './store.js'
import Cover from './components/Cover.jsx'
import Chapter from './components/Chapter.jsx'
import Ledger from './components/Ledger.jsx'
import Report from './components/Report.jsx'
import Toc from './components/Toc.jsx'

function readHash() {
  const h = window.location.hash.replace(/^#\/?/, '')
  if (byId[h] || h === 'report' || h === 'toc') return h
  return ''
}

export default function App() {
  const store = useStore()
  const [route, setRoute] = useState(readHash)
  const [ledgerOpen, setLedgerOpen] = useState(false)

  useEffect(() => {
    const on = () => setRoute(readHash())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    setLedgerOpen(false)
  }, [route])

  useEffect(() => {
    const el = document.documentElement
    el.dataset.theme = store.prefs.theme
    el.style.setProperty('--fs', `${store.prefs.size}px`)
  }, [store.prefs])

  const go = useCallback((r) => {
    window.location.hash = r ? `/${r}` : ''
  }, [])

  const chapter = byId[route]
  const done = Object.keys(store.choices).length

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => go('')} aria-label="回到封面">
          <span className="brand-mark">φ</span>
          <span className="brand-name">你接受什么，就要承认什么</span>
        </button>
        <nav className="top-actions">
          <button className="ghost" onClick={() => go('toc')}>目录</button>
          <button className="ghost" onClick={() => store.setPrefs({ size: store.prefs.size >= 21 ? 16 : store.prefs.size + 1 })} title="字号">
            A<small>{store.prefs.size}</small>
          </button>
          <button
            className="ghost"
            onClick={() => store.setPrefs({ theme: store.prefs.theme === 'dark' ? 'light' : store.prefs.theme === 'light' ? 'auto' : 'dark' })}
            title="明暗"
          >
            {store.prefs.theme === 'dark' ? '夜' : store.prefs.theme === 'light' ? '昼' : '自动'}
          </button>
          <button className="ledger-btn" onClick={() => setLedgerOpen(true)}>
            立场账本 <span className="pill">{done}/{chapters.length}</span>
          </button>
        </nav>
      </header>

      <main>
        {route === '' && <Cover go={go} store={store} />}
        {route === 'toc' && <Toc go={go} store={store} />}
        {chapter && <Chapter key={chapter.id} ch={chapter} go={go} store={store} />}
        {route === 'report' && <Report go={go} store={store} />}
      </main>

      <Ledger open={ledgerOpen} onClose={() => setLedgerOpen(false)} go={go} store={store} current={route} />

      <footer className="foot">
        <span>一本会翻旧账的哲学小书</span>
        <a href="https://github.com/Sparky579/phi-dilemmas" target="_blank" rel="noreferrer">源码</a>
      </footer>
    </div>
  )
}
