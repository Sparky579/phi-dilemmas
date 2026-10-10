import React from 'react'
import { chapters } from '../content/index.js'

export default function Cover({ go, store }) {
  const firstUnread = chapters.find((c) => !store.choices[c.id])
  const started = Object.keys(store.choices).length > 0
  return (
    <section className="cover">
      <p className="cover-kicker">一本互动哲学小书 · 十一个两难</p>
      <h1 className="cover-title">
        你接受什么，
        <br />
        就要承认什么
      </h1>
      <p className="cover-lede">
        每一章一个问题，你得选一边。选完，这本书会替你说说这一边的好话，再告诉你它附带的条款。
        后面的章节会翻你的旧账。读到最后，你会拿到一份只属于你的立场报告。
      </p>
      <div className="cover-actions">
        {started && firstUnread ? (
          <>
            <button className="primary" onClick={() => go(firstUnread.id)}>
              接着读：第{firstUnread.index}章
            </button>
            <button className="ghost" onClick={() => go('toc')}>看目录</button>
          </>
        ) : started ? (
          <>
            <button className="primary" onClick={() => go('report')}>翻到立场报告</button>
            <button className="ghost" onClick={() => go('toc')}>看目录</button>
          </>
        ) : (
          <>
            <button className="primary" onClick={() => go('ch0')}>从第0章开始</button>
            <button className="ghost" onClick={() => go('toc')}>看目录</button>
          </>
        )}
      </div>
      <ol className="cover-list">
        {chapters.map((c) => (
          <li key={c.id}>
            <button onClick={() => go(c.id)}>
              <span className="n">{c.index}</span>
              <span className="t">{c.title}</span>
              {store.choices[c.id] && <span className="dot" aria-label="已选" />}
            </button>
          </li>
        ))}
      </ol>
      <p className="cover-note">没有标准答案，但有自洽和不自洽之分。你的选择只存在这台设备的浏览器里。</p>
    </section>
  )
}
