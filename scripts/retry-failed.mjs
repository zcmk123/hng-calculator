/**
 * 对下载失败的武器，用 Fandom 搜索 API 找到正确页面名后重试下载
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const report = JSON.parse(readFileSync(resolve(__dirname, 'download-report.json'), 'utf8'))
const failures = report.failures
const outDir = resolve(root, 'public/weapons')

const API = 'https://heroesandgenerals.fandom.com/api.php'
const UA = 'hng-calculator-image-fetcher/1.0 (github.com/zcmk123/hng-calculator)'
const THUMB_SIZE = 400
const DELAY_MS = 350

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

/** 搜索 Fandom wiki 找到最匹配的页面标题 */
async function searchPage(query) {
  const url = `${API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=3&srprop=`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`search ${res.status}`)
  const data = await res.json()
  const hits = data?.query?.search
  if (!hits || hits.length === 0) throw new Error('no search results')
  return hits.map((h) => h.title)
}

async function getThumbUrl(title) {
  const url = `${API}?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=${THUMB_SIZE}&piprop=thumbnail`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  const pages = data?.query?.pages
  if (!pages) throw new Error('no pages')
  const page = Object.values(pages)[0]
  if (page.missing !== undefined) throw new Error('page missing')
  if (!page.thumbnail) throw new Error('no thumbnail')
  return page.thumbnail.source
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
  console.log(`Retrying ${failures.length} failed weapons with search...\n`)
  const stillFailed = []
  let recovered = 0

  for (const f of failures) {
    const progress = `[${recovered + stillFailed.length + 1}/${failures.length}]`
    try {
      console.log(`${progress} searching: ${f.id} ${f.name}`)
      const titles = await searchPage(f.name)
      console.log(`  results: ${titles.join(', ')}`)

      let success = false
      for (const title of titles) {
        try {
          const thumbUrl = await getThumbUrl(title)
          const ext = extFromUrl(thumbUrl)
          const dest = resolve(outDir, `${f.id}.${ext}`)
          await downloadImage(thumbUrl, dest)
          console.log(`  ok: ${f.id} ${f.name} → ${f.id}.${ext} (via "${title}")`)
          recovered++
          success = true
          break
        } catch (e) {
          // 继续尝试下一个搜索结果
        }
      }
      if (!success) throw new Error('no thumbnail in any search result')
    } catch (e) {
      stillFailed.push({ ...f, retryError: e.message })
      console.log(`  FAIL: ${f.id} ${f.name} — ${e.message}`)
    }
    await sleep(DELAY_MS)
  }

  // 更新报告
  report.failures = stillFailed
  report.recovered = recovered
  report.success = report.success + recovered
  report.failed = stillFailed.length
  writeFileSync(resolve(__dirname, 'download-report.json'), JSON.stringify(report, null, 2))

  console.log(`\n=== 重试完成 ===`)
  console.log(`恢复: ${recovered} / 仍失败: ${stillFailed.length}`)
  if (stillFailed.length > 0) {
    console.log(`\n仍失败列表:`)
    stillFailed.forEach((f) => console.log(`  ${f.id}\t${f.name}\t${f.retryError}`))
  }
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1) })
