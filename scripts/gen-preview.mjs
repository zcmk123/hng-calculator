/**
 * 生成图片预览 HTML 页面，让用户确认所有武器图片
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const weapons = JSON.parse(readFileSync(resolve(__dirname, 'weapon-list.json'), 'utf8'))
const imgDir = resolve(root, 'public/weapons')
const imgFiles = readdirSync(imgDir)

const items = weapons.map((w) => {
  const file = imgFiles.find((f) => f.startsWith(`${w.id}.`))
  return { ...w, hasImg: !!file, img: file || '' }
})

const html = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<title>武器图片预览 — H&G Calculator</title>
<style>
  body { background: #15170f; color: #dcd8c4; font-family: system-ui, sans-serif; margin: 20px; }
  h1 { color: #c9a24b; font-size: 20px; }
  .stats { color: #9a977f; font-size: 13px; margin-bottom: 20px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
  .card { background: #1e2117; border: 1px solid #3a3f2c; border-radius: 3px; padding: 8px; text-align: center; }
  .card.missing { border-color: #c85a3f; opacity: 0.6; }
  .card img { max-width: 100%; max-height: 120px; object-fit: contain; }
  .card .id { font-family: monospace; font-size: 11px; color: #6c6a56; }
  .card .name { font-size: 12px; margin-top: 4px; }
  .card .status { font-size: 10px; color: #c85a3f; }
</style>
</head>
<body>
<h1>武器图片预览</h1>
<div class="stats">总计 ${items.length} 件武器 · 有图 ${items.filter(i => i.hasImg).length} · 缺图 ${items.filter(i => !i.hasImg).length}</div>
<div class="grid">
${items.map((w) => w.hasImg
  ? `<div class="card"><img src="../public/weapons/${w.img}" alt="${w.name}"><div class="id">#${w.id}</div><div class="name">${w.name}</div></div>`
  : `<div class="card missing"><div style="height:120px;display:flex;align-items:center;justify-content:center;color:#6c6a56;">无图</div><div class="id">#${w.id}</div><div class="name">${w.name}</div><div class="status">缺失</div></div>`
).join('\n')}
</div>
</body>
</html>`

writeFileSync(resolve(__dirname, 'preview.html'), html)
console.log(`Preview written to scripts/preview.html`)
console.log(`Total: ${items.length} · With image: ${items.filter(i => i.hasImg).length} · Missing: ${items.filter(i => !i.hasImg).length}`)
