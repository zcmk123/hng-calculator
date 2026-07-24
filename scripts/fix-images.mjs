/**
 * 用 File:WPN_{id}.png 精确查询 Fandom 图片
 * wiki 上图片命名规则为 WPN_{weaponId}.png，比搜索页面更准确
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const outDir = resolve(root, 'public/weapons')

const API = 'https://heroesandgenerals.fandom.com/api.php'
const UA = 'hng-calculator-image-fetcher/1.0 (github.com/zcmk123/hng-calculator)'
const THUMB_SIZE = 400

// 需要修复的武器（图片匹配错误或缺失）
const toFix = [
  { id: 22, name: 'Tula Tokarev 33' },
  { id: 59, name: 'Panzerwurfmine Lang' },
  { id: 67, name: 'P38 Parabellum' },
  { id: 73, name: 'German First Aid Kit' },
  { id: 74, name: 'Soviet First Aid Kit' },
  { id: 75, name: 'U.S. First Aid Kit' },
  { id: 78, name: 'U.S. Medic Pouch' },
  { id: 79, name: 'Soviet Medic Pouch' },
  { id: 89, name: 'German Medic Pouch' },
  { id: 152, name: 'Snowball' },
  { id: 153, name: 'Easter Egg' },
]

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

/** 用 File:WPN_{id}.png 查询图片缩略图 URL */
async function getFileThumbUrl(fileTitle) {
  const url = `${API}?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&format=json&iiprop=url&iiurlwidth=${THUMB_SIZE}`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  const pages = data?.query?.pages
  if (!pages) throw new Error('no pages')
  const page = Object.values(pages)[0]
  if (page.missing !== undefined) throw new Error('file missing')
  if (!page.imageinfo || !page.imageinfo[0]) throw new Error('no imageinfo')
  const info = page.imageinfo[0]
  return info.thumburl || info.url
}

function extFromUrl(url) {
  const clean = url.split('?')[0].split('/revision')[0]
  const m = clean.match(/\.(png|jpg|jpeg|gif|webp)$/i)
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'png'
}

async function downloadImage(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`download ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(dest, buf)
}

async function main() {
  console.log(`Fixing ${toFix.length} weapons via File:WPN_{id}.png...\n`)
  const results = []

  for (const w of toFix) {
    const fileTitle = `File:WPN_${w.id}.png`
    const progress = `[${results.length + 1}/${toFix.length}]`
    try {
      console.log(`${progress} ${w.id} ${w.name} — querying ${fileTitle}`)
      const thumbUrl = await getFileThumbUrl(fileTitle)
      const ext = extFromUrl(thumbUrl)
      const dest = resolve(outDir, `${w.id}.${ext}`)
      await downloadImage(thumbUrl, dest)
      results.push({ ...w, status: 'ok', ext })
      console.log(`  ok → ${w.id}.${ext}`)
    } catch (e) {
      results.push({ ...w, status: 'fail', error: e.message })
      console.log(`  FAIL: ${e.message}`)
    }
    await sleep(350)
  }

  const ok = results.filter((r) => r.status === 'ok')
  const fail = results.filter((r) => r.status === 'fail')
  console.log(`\n=== 修复完成 ===`)
  console.log(`成功: ${ok.length} / 失败: ${fail.length}`)
  if (fail.length > 0) {
    console.log(`\n仍失败:`)
    fail.forEach((f) => console.log(`  ${f.id}\t${f.name}\t${f.error}`))
  }
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1) })
