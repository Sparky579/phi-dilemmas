import React, { useEffect, useRef, useState } from 'react'
import { chapters, byId, optionOf, matches } from '../content/index.js'
import { Paras, Inline } from './Text.jsx'
import Prediction from './Prediction.jsx'
import Dice from './Dice.jsx'

function OptionCard({ o, picked, faded, onPick }) {
  return (
    <button
      className={'option' + (picked ? ' picked' : '') + (faded ? ' faded' : '')}
      onClick={onPick}
      aria-pressed={picked}
    >
      <span className="option-key">{o.key.length === 1 ? o.key : ''}</span>
      <span className="option-body">
        <span className="option-label">{o.label}</span>
        <span className="option-detail">
          <Inline text={o.detail} />
        </span>
      </span>
    </button>
  )
}

function School({ s }) {
  return (
    <div className="school">
      <div className="school-head">
        <span className="school-name">{s.name}</span>
        {s.who && <span className="school-who">{s.who}</span>}
      </div>
      <div className="school-grid">
        <div>
          <span className="school-tag yes">它声称</span>
          <p><Inline text={s.claims} /></p>
        </div>
        <div>
          <span className="school-tag no">它不能声称</span>
          <p><Inline text={s.cannot} /></p>
        </div>
      </div>
    </div>
  )
}

export default function Chapter({ ch, go, store }) {
  const pick = store.choices[ch.id]
  const chosen = optionOf(ch, pick)
  const [showHidden, setShowHidden] = useState(pick && ch.hiddenOption?.key === pick)
  const [showOthers, setShowOthers] = useState(false)
  const responseRef = useRef(null)
  const justPicked = useRef(false)

  const idx = chapters.indexOf(ch)
  const next = chapters[idx + 1]
  const prev = chapters[idx - 1]

  useEffect(() => {
    if (justPicked.current && responseRef.current) {
      justPicked.current = false
      const y = responseRef.current.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }, [pick])

  const onPick = (key) => {
    if (pick === key) return
    justPicked.current = true
    store.choose(ch.id, key)
  }

  const allOptions = [...ch.options, ...(showHidden && ch.hiddenOption ? [ch.hiddenOption] : [])]
  const others = allOptions.filter((o) => o.key !== pick)
  const callbacks = pick ? (ch.callbacks || []).filter((c) => matches(c.when, store.choices)) : []

  return (
    <article className="chapter page">
      <p className="kicker">
        第{ch.index}章 <span className="sep">·</span> {ch.tag}
      </p>
      <h1 className="title">{ch.title}</h1>

      <div className="prose opening">
        <Paras list={ch.opening} />
      </div>

      {ch.prediction && <Prediction ch={ch} store={store} />}

      <section className="dilemma">
        <p className="dilemma-label">两难</p>
        <p className="dilemma-q">
          <Inline text={ch.question} />
        </p>
        <div className="options">
          {allOptions.map((o) => (
            <OptionCard key={o.key} o={o} picked={pick === o.key} faded={pick && pick !== o.key} onPick={() => onPick(o.key)} />
          ))}
        </div>
        {ch.hiddenOption && !showHidden && (
          <button className="hidden-reveal" onClick={() => setShowHidden(true)}>
            {ch.hiddenOption.reveal || '两个都不想选？'}
          </button>
        )}
        {!pick && <p className="gate">选一个，这一章后面的内容才会展开。</p>}
      </section>

      {chosen && (
        <div className="after" key={pick}>
          <section className="response" ref={responseRef}>
            <p className="response-label">你选了「{chosen.label}」</p>
            <div className="prose">
              <Paras list={chosen.response} />
            </div>
          </section>

          <section className="clause">
            <p className="clause-label">附加条款</p>
            <p className="clause-text">
              <Inline text={chosen.cost} />
            </p>
            <button className="link" onClick={() => setShowOthers((v) => !v)}>
              {showOthers ? '收起' : '看看另一边要签的条款'}
            </button>
            {showOthers && (
              <ul className="other-costs">
                {others.map((o) => (
                  <li key={o.key}>
                    <b>{o.label}：</b>
                    <Inline text={o.cost} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {ch.prediction && <Prediction ch={ch} store={store} reveal />}

          {callbacks.length > 0 && (
            <section className="callbacks">
              <p className="callbacks-label">翻旧账</p>
              {callbacks.map((c, i) => (
                <div className="callback" key={i}>
                  <p className="callback-src">
                    {Object.keys(c.when)
                      .filter((id) => id !== ch.id)
                      .map((id) => `第${byId[id].index}章你选了「${optionOf(byId[id], store.choices[id])?.label}」`)
                      .join('，')}
                  </p>
                  <p>
                    <Inline text={c.text} />
                  </p>
                </div>
              ))}
            </section>
          )}

          {ch.dice && <Dice ch={ch} store={store} />}

          <div className="sections">
            {ch.sections.map((s, i) => (
              <section className="sec" key={i}>
                <h2>
                  <span className="sec-n">{String(i + 1).padStart(2, '0')}</span>
                  {s.title}
                </h2>
                <div className="prose">
                  <Paras list={s.body} />
                </div>
                {s.schools?.map((sc, j) => <School s={sc} key={j} />)}
                {s.aside && (
                  <aside className="aside">
                    <p className="aside-title">{s.aside.title}</p>
                    <Paras list={s.aside.body} />
                  </aside>
                )}
              </section>
            ))}
          </div>

          {ch.terms?.length > 0 && (
            <div className="terms">
              <span className="terms-label">本章涉及</span>
              {ch.terms.map((t) => (
                <span className="term" key={t}>{t}</span>
              ))}
            </div>
          )}

          <p className="hook">
            <Inline text={ch.hook} />
          </p>

          <button className="link small" onClick={() => store.unchoose(ch.id)}>改主意了，重新选</button>
        </div>
      )}

      <nav className="pager">
        {prev ? (
          <button className="ghost" onClick={() => go(prev.id)}>← 第{prev.index}章</button>
        ) : (
          <span />
        )}
        {next ? (
          <button className={pick ? 'primary' : 'ghost'} onClick={() => go(next.id)}>
            第{next.index}章 →
          </button>
        ) : (
          <button className={pick ? 'primary' : 'ghost'} onClick={() => go('report')}>翻到立场报告 →</button>
        )}
      </nav>
    </article>
  )
}
