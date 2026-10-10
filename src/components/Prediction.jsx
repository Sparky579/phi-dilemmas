import React, { useEffect } from 'react'
import { optionOf } from '../content/index.js'
import { Paras, Inline } from './Text.jsx'

// 一个很粗糙的“算法”：前面越常咬子弹、越相信一切都是物理过程，就越猜你选“不自由”
function predict(choices) {
  let s = 0
  if (choices.ch0 === 'agree') s += 1
  if (choices.ch1 === 'B') s += 1
  if (choices.ch2 === 'B') s += 1
  if (choices.ch4 === 'ride') s += 1
  if (choices.ch5 === 'yes') s += 1
  if (choices.ch2 === 'A') s -= 1
  if (choices.ch4 === 'walk') s -= 1
  return s >= 3 ? 'unfree' : 'free'
}

export default function Prediction({ ch, store, reveal }) {
  const sealed = store.extra.prediction
  const pick = store.choices[ch.id]

  useEffect(() => {
    if (!sealed && !pick) store.setExtra('prediction', predict(store.choices))
  }, [sealed, pick])

  if (!reveal) {
    if (pick) return null
    return (
      <div className="envelope">
        <div className="envelope-seal">封</div>
        <div>
          <p className="envelope-title">信封里写着我对你的预测</p>
          <p className="envelope-text">
            <Inline text={ch.prediction.intro} />
          </p>
        </div>
      </div>
    )
  }

  if (!sealed) return null
  const hit = sealed === pick
  const guess = optionOf(ch, sealed)
  return (
    <section className={'envelope open ' + (hit ? 'hit' : 'miss')}>
      <p className="envelope-title">拆开信封：我猜你会选「{guess?.label}」。{hit ? '猜中了。' : '猜错了。'}</p>
      <div className="prose">
        <Paras list={hit ? ch.prediction.hit : ch.prediction.miss} />
      </div>
    </section>
  )
}
