import React, { useMemo, useState } from 'react'
import { chapters, byId, optionOf, matches } from '../content/index.js'
import { perChoice, combos, axes } from '../content/report.js'
import { Inline } from './Text.jsx'
import { tierOf } from './Dice.jsx'

function axisScore(axis, choices) {
  let sum = 0
  let n = 0
  for (const [id, map] of Object.entries(axis.votes)) {
    const c = choices[id]
    if (c && c in map) {
      sum += map[c]
      n += 1
    }
  }
  return { sum, n, max: Object.keys(axis.votes).length }
}

export default function Report({ go, store }) {
  const { choices, extra } = store
  const done = chapters.filter((c) => choices[c.id])
  const missing = chapters.filter((c) => !choices[c.id])
  const [copied, setCopied] = useState(false)
  const [allT, setAllT] = useState(false)

  const tensions = useMemo(() => {
    const out = []
    for (const c of chapters) {
      if (!choices[c.id]) continue
      for (const cb of c.callbacks || []) if (matches(cb.when, choices)) out.push({ ch: c, text: cb.text })
    }
    return out
  }, [choices])

  const questions = useMemo(() => {
    const qs = combos.filter((c) => matches(c.when, choices)).slice(0, 4).map((c) => c.q)
    const singles = chapters.filter((c) => choices[c.id]).map((c) => perChoice[c.id]?.[choices[c.id]]).filter(Boolean)
    // 单选的问题从后往前取，越靠后的章越接近“怎么活”
    for (const q of singles.reverse()) {
      if (qs.length >= 8) break
      qs.push(q)
    }
    return qs
  }, [choices])

  if (done.length === 0) {
    return (
      <section className="report page">
        <p className="kicker">终章</p>
        <h1 className="title">你的立场报告</h1>
        <p className="prose-p">账本还是空的。报告是用你的选择写成的，没有选择，就没有可以翻的旧账。</p>
        <button className="primary" onClick={() => go('ch0')}>从第0章开始</button>
      </section>
    )
  }

  const diceTier = extra.dice && byId.ch9.dice && tierOf(byId.ch9.dice, extra.dice.world, extra.dice.roll)

  const copy = async () => {
    const lines = ['我的立场报告 · 你接受什么，就要承认什么', '']
    for (const c of done) lines.push(`第${c.index}章 ${c.title}　→　${optionOf(c, choices[c.id]).label}`)
    lines.push('', '留给我的问题：')
    questions.forEach((q, i) => lines.push(`${i + 1}. ${q}`))
    lines.push('', window.location.origin)
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('复制下面这段：', lines.join('\n'))
    }
  }

  return (
    <section className="report page">
      <p className="kicker">终章</p>
      <h1 className="title">你的立场报告</h1>
      <p className="prose-p lead">
        你一共签了 {done.length} 份合同。下面不是判决书。它只是把你自己的选择摆在一起，让它们互相看一眼。
      </p>
      {missing.length > 0 && (
        <p className="report-missing">
          还有 {missing.length} 章没选：
          {missing.map((c, i) => (
            <button key={c.id} className="link" onClick={() => go(c.id)}>
              第{c.index}章{i < missing.length - 1 ? '、' : ''}
            </button>
          ))}
          。报告会因此少几处可以翻的账。
        </p>
      )}

      <h2 className="report-h">一、你的账本</h2>
      <ol className="report-ledger">
        {done.map((c) => {
          const o = optionOf(c, choices[c.id])
          return (
            <li key={c.id}>
              <button onClick={() => go(c.id)}>
                <span className="rl-n">{c.index}</span>
                <span className="rl-t">{c.title}</span>
                <span className="rl-pick">{o.label}</span>
              </button>
            </li>
          )
        })}
      </ol>
      {(extra.prediction && choices.ch6) || diceTier ? (
        <p className="report-extra">
          {extra.prediction && choices.ch6 && (
            <>第6章的信封{extra.prediction === choices.ch6 ? '猜中了你' : '没猜中你'}。</>
          )}
          {diceTier && (
            <>
              第9章你在 {extra.dice.world} 世界投胎到第 {extra.dice.roll} 百分位：{diceTier.title}。
            </>
          )}
        </p>
      ) : null}

      <h2 className="report-h">二、三条倾向</h2>
      <div className="axes">
        {axes.map((a) => {
          const { sum, n, max } = axisScore(a, choices)
          if (n === 0) return null
          const pos = n ? sum / n : 0
          const side = pos > 0.34 ? 'right' : pos < -0.34 ? 'left' : 'mid'
          return (
            <div className="axis" key={a.name}>
              <p className="axis-name">
                {a.name}
                <span className="axis-n">依据 {n}/{max} 题</span>
              </p>
              <div className="axis-bar">
                <span className="axis-end">{a.left}</span>
                <span className="axis-track">
                  <span className="axis-dot" style={{ left: `${50 + pos * 45}%` }} />
                </span>
                <span className="axis-end">{a.right}</span>
              </div>
              <p className="axis-read">{a.read[side]}</p>
            </div>
          )
        })}
      </div>

      <h2 className="report-h">三、账本里的张力</h2>
      {tensions.length === 0 ? (
        <p className="prose-p">这一路上，你的选择没有触发任何一次翻旧账。要么你非常自洽，要么你跳过了几章。也可能，你只是把矛盾藏得比这本书找得更深。</p>
      ) : (
        <div className="tensions">
          {(allT ? tensions : tensions.slice(0, 5)).map((t, i) => (
            <div className="tension" key={i}>
              <span className="tension-ch">第{t.ch.index}章</span>
              <p>
                <Inline text={t.text} />
              </p>
            </div>
          ))}
          {tensions.length > 5 && !allT && (
            <button className="link" onClick={() => setAllT(true)}>还有 {tensions.length - 5} 处，全部展开</button>
          )}
        </div>
      )}

      <h2 className="report-h">四、留给你的问题</h2>
      <p className="prose-p">这些问题这本书不打算回答。它们是用你自己的选择拼出来的，所以只有你能接着往下想。</p>
      <ol className="questions">
        {questions.map((q, i) => (
          <li key={i}>
            <Inline text={q} />
          </li>
        ))}
      </ol>

      <div className="coda">
        <p>
          第0章说，遇到不想要的结论只有三条路：认了，放弃一个前提，或者找一个新的区分。现在你手里有一份自己签的合同，上面也许有几处条款互相打架。
        </p>
        <p>
          这不丢人。苏格拉底在街上拦住人问问题，问到最后，对方几乎总会发现自己的看法彼此冲突。他没有因此瞧不起谁，他觉得这正是开始想事情的地方。
        </p>
        <p>你可以过一段时间再回来，重新选一遍，看看哪几题你换了边。</p>
      </div>

      <div className="report-actions">
        <button className="primary" onClick={copy}>{copied ? '已复制' : '复制我的报告'}</button>
        <button className="ghost" onClick={() => go('toc')}>回到目录</button>
        <button
          className="link small"
          onClick={() => {
            if (window.confirm('清空所有选择，从头再来？')) {
              store.reset()
              go('')
            }
          }}
        >
          清空账本，重读一遍
        </button>
      </div>
    </section>
  )
}
