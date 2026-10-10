import React from 'react'
import { chapters, optionOf } from '../content/index.js'

export default function Toc({ go, store }) {
  return (
    <section className="toc page">
      <p className="kicker">目录</p>
      <h1 className="title">十一个两难</h1>
      <ol className="toc-list">
        {chapters.map((c) => {
          const o = optionOf(c, store.choices[c.id])
          return (
            <li key={c.id}>
              <button onClick={() => go(c.id)}>
                <span className="toc-n">第{c.index}章</span>
                <span className="toc-t">{c.title}</span>
                <span className="toc-tag">{c.tag}</span>
                <span className={'toc-pick' + (o ? ' on' : '')}>{o ? `你选了：${o.label}` : '未选'}</span>
              </button>
            </li>
          )
        })}
        <li>
          <button onClick={() => go('report')}>
            <span className="toc-n">终章</span>
            <span className="toc-t">你的立场报告</span>
            <span className="toc-tag">翻旧账</span>
            <span className="toc-pick">{Object.keys(store.choices).length}/{chapters.length}</span>
          </button>
        </li>
      </ol>
    </section>
  )
}
