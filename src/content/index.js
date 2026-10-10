import ch0 from './ch0.js'
import ch1 from './ch1.js'
import ch2 from './ch2.js'
import ch3 from './ch3.js'
import ch4 from './ch4.js'
import ch5 from './ch5.js'
import ch6 from './ch6.js'
import ch7 from './ch7.js'
import ch8 from './ch8.js'
import ch9 from './ch9.js'
import ch10 from './ch10.js'

export const chapters = [ch0, ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10]
export const byId = Object.fromEntries(chapters.map((c) => [c.id, c]))

export function optionOf(ch, key) {
  if (!ch || !key) return null
  return ch.options.find((o) => o.key === key) || (ch.hiddenOption?.key === key ? ch.hiddenOption : null)
}

// when: { ch1: 'B', ch2: ['A','C'] }
export function matches(when, choices) {
  return Object.entries(when).every(([id, v]) => {
    const c = choices[id]
    return c && (Array.isArray(v) ? v.includes(c) : v === c)
  })
}
