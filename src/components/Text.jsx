import React from 'react'

// 只认两种行内标记：**加粗** 和 *强调*
export function Inline({ text }) {
  const parts = []
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g
  let last = 0
  let m
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(m[1] ? <strong key={i++}>{m[1]}</strong> : <em key={i++}>{m[2]}</em>)
    last = re.lastIndex
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

export function Paras({ list, className }) {
  if (!list) return null
  const arr = Array.isArray(list) ? list : [list]
  return arr.map((p, i) => (
    <p key={i} className={className}>
      <Inline text={p} />
    </p>
  ))
}
