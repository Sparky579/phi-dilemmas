import React, { useEffect } from 'react'
import { chapters, optionOf } from '../content/index.js'

export default function Ledger({ open, onClose, go, store, current }) {
  useEffect(() => {
    if (!open) return
    const on = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [open, onClose])

  return (
    <>
      <div className={'scrim' + (open ? ' on' : '')} onClick={onClose} />
      <aside className={'ledger' + (open ? ' on' : '')} aria-hidden={!open}>
        <div className="ledger-head">
          <p className="ledger-title">立场账本</p>
          <button className="ghost" onClick={onClose} aria-label="关闭">✕</button>
        </div>
        <p className="ledger-sub">你签过的每一份合同，和它的附加条款。</p>
        <ol className="ledger-list">
          {chapters.map((c) => {
            const o = optionOf(c, store.choices[c.id])
            return (
              <li key={c.id} className={(o ? 'on' : '') + (current === c.id ? ' here' : '')}>
                <button onClick={() => go(c.id)}>
                  <span className="ledger-n">{c.index}</span>
                  <span className="ledger-main">
                    <span className="ledger-t">{c.title}</span>
                    {o ? (
                      <>
                        <span className="ledger-pick">{o.label}</span>
                        <span className="ledger-cost">{o.cost.replace(/\*/g, '')}</span>
                      </>
                    ) : (
                      <span className="ledger-empty">还没选</span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        <div className="ledger-foot">
          <button className="primary" onClick={() => go('report')}>生成立场报告</button>
          <button
            className="link small"
            onClick={() => {
              if (window.confirm('清空所有选择，从头再来？')) {
                store.reset()
                go('')
              }
            }}
          >
            清空账本
          </button>
        </div>
      </aside>
    </>
  )
}
