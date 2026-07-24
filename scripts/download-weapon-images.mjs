/**
 * 从 Heroes & Generals Fandom Wiki 下载所有武器图片
 * 使用 MediaWiki API 获取页面主图（pageimages），下载到 public/weapons/{id}.{ext}
 *
 * 用法：node scripts/download-weapon-images.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const weapons = JSON.parse(readFileSync(resolve(__dirname, 'weapon-list.json'), 'utf8'))
const outDir = resolve(root, 'public/weapons')
mkdirSync(outDir, { recursive: true })

const API = 'https://heroesandgenerals.fandom.com/api.php'
const UA = 'hng-calculator-image-fetcher/1.0 (github.com/zcmk123/hng-calculator)'
const THUMB_SIZE = 400
const DELAY_MS = 350

const errors = []
const ok = []

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/** 调用 Fandom MediaWiki API 获取页面主图缩略图 URL */
async function getThumbUrl(title) {
  const url = `${API}?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=${THUMB_SIZE}&piprop=thumbnail`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`API ${res.status} for ${title}`)
  const data = await res.json()
  const pages = data?.query?.pages
  if (!pages) throw new Error(`no pages in API response for ${title}`)
  const page = Object.values(pages)[0]
  if (page.missing !== undefined) throw new Error(`page missing: ${title}`)
  if (!page.thumbnail) throw new Error(`no thumbnail for ${title}`)
  return page.thumbnail.source
}

/** 从 URL 推断图片扩展名 */
function extFromUrl(url) {
  // Fandom CDN URL 形如 .../revision/latest/thumbnail/400/400/scale-to-width-down/400?cb=...
  // 或 .../path/to/file.png/revision/...
  const clean = url.split('?')[0].split('/revision')[0]
  const m = clean.match(/\.(png|jpg|jpeg|gif|webp)$/i)
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'png'
}

/** 下载图片到本地 */
async function downloadImage(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`download ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(dest, buf)
}

async function main() {
  console.log(`Downloading images for ${weapons.length} weapons...\n`)
  for (const w of weapons) {
    const title = w.name.replace(/ /g, '_')
    const progress = `[${ok.length + errors.length + 1}/${weapons.length}]`
    try {
      // 检查是否已下载（支持断点续传）
      const possibleExts = ['png', 'jpg', 'webp', 'gif']
      const existing = possibleExts.find((e) => existsSync(resolve(outDir, `${w.id}.${e}`)))
      if (existing) {
        ok.push({ id: w.id, name: w.name, ext: existing })
        console.log(`${progress} skip (exists): ${w.id} ${w.name}`)
        continue
      }

      const thumbUrl = await getThumbUrl(title)
      const ext = extFromUrl(thumbUrl)
      const dest = resolve(outDir, `${w.id}.${ext}`)
      await downloadImage(thumbUrl, dest)
      ok.push({ id: w.id, name: w.name, ext })
      console.log(`${progress} ok: ${w.id} ${w.name} → ${w.id}.${ext}`)
    } catch (e) {
      errors.push({ id: w.id, name: w.name, error: e.message })
      console.log(`${progress} FAIL: ${w.id} ${w.name} — ${e.message}`)
    }
    await sleep(DELAY_MS)
  }

  // 输出报告
  const report = {
    total: weapons.length,
    success: ok.length,
    failed: errors.length,
    failures: errors,
  }
  writeFileSync(resolve(__dirname, 'download-report.json'), JSON.stringify(report, null, 2))

  console.log(`\n=== 下载完成 ===`)
  console.log(`成功: ${ok.length} / 失败: ${errors.length} / 总计: ${weapons.length}`)
  if (errors.length > 0) {
    console.log(`\n失败列表（需人工补图）:`)
    errors.forEach((e) => console.log(`  ${e.id}\t${e.name}\t${e.error}`))
  }
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
