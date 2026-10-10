import React, { useEffect, useRef, useState } from 'react'
import { Paras } from './Text.jsx'

export const tierOf = (dice, world, roll) => dice[world]?.find((t) => roll <= t.max)

export default function Dice({ ch, store }) {
  const world = store.choices[ch.id]
  const saved = store.extra.dice
  const [rolling, setRolling] = useState(false)
  const [face, setFace] = useState(null)
  const timer = useRef(null)

  useEffect(() => () => clearInterval(timer.current), [])

  const roll = () => {
    setRolling(true)
    let n = 0
    timer.current = setInterval(() => {
      setFace(1 + Math.floor(Math.random() * 100))
      if (++n > 18) {
        clearInterval(timer.current)
        const r = 1 + Math.floor(Math.random() * 100)
        setFace(r)
        setRolling(false)
        store.setExtra('dice', { world, roll: r, rolls: (saved?.rolls || 0) + 1 })
      }
    }, 60)
  }

  const result = saved && saved.world === world && !rolling ? saved : null
  const tier = result && tierOf(ch.dice, world, result.roll)

  return (
    <section className="dice">
      <p className="dice-label">投胎</p>
      <p className="dice-intro">规则你已经定好了：{world} 世界。现在掷骰子，看你落在第几百分位（1 是最底层，100 是最顶端）。</p>
      <div className="dice-row">
        <div className={'dice-face' + (rolling ? ' rolling' : '')}>{rolling ? face : result ? result.roll : '?'}</div>
        <button className="primary" onClick={roll} disabled={rolling}>
          {result ? '再掷一次' : '掷骰子'}
        </button>
      </div>
      {tier && (
        <div className="dice-result">
          <p className="dice-title">{tier.title}</p>
          <div className="prose">
            <Paras list={tier.text} />
          </div>
          {result.rolls > 1 && <p className="dice-note">这是你第 {result.rolls} 次掷骰子。现实里的那一次，是不给重来的。</p>}
        </div>
      )}
    </section>
  )
}
