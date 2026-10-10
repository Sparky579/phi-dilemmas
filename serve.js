// 零依赖静态服务：只托管 dist/，未知路径回落到 index.html
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist')
const port = Number(process.env.PORT || 8851)
const host = process.env.HOST || '127.0.0.1'
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
}

http
  .createServer((req, res) => {
    let p
    try {
      p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    } catch {
      res.writeHead(400).end()
      return
    }
    let file = path.normalize(path.join(root, p))
    if (!file.startsWith(root)) {
      res.writeHead(403).end()
      return
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html')
    const ext = path.extname(file)
    const headers = { 'Content-Type': types[ext] || 'application/octet-stream' }
    // 带 hash 的资源可以长缓存，index.html 每次都要新的
    headers['Cache-Control'] = file.includes(`${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache'
    res.writeHead(200, headers)
    fs.createReadStream(file).pipe(res)
  })
  .listen(port, host, () => console.log(`phi on http://${host}:${port}`))
