/**
 * 测试脚本：只下载前 3 个武器图片，验证流程
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const weapons = JSON.parse(readFileSync(resolve(__dirname, 'weapon-list.json'), 'utf8')).slice(0, 3)
const outDir = resolve(root, 'public/weapons')
mkdirSync(outDir, { recursive: true })

const API = 'https://heroesandgenerals.fandom.com/api.php'
const UA = 'hng-calculator-image-fetcher/1.0 (github.com/zcmk123/hng-calculator)'

async function getThumbUrl(title) {
  const url = `${API}?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=400&piprop=thumbnail`
  console.log(`GET ${url}`)
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  console.log(`status: ${res.status}`)
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  console.log(`response: ${JSON.stringify(data).substring(0, 500)}`)
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
  console.log(`saved ${dest} (${buf.length} bytes)`)
}

for (const w of weapons) {
  const title = w.name.replace(/ /g, '_')
  console.log(`\n--- ${w.id} ${w.name} (title: ${title}) ---`)
  try {
    const thumbUrl = await getThumbUrl(title)
    console.log(`thumb URL: ${thumbUrl}`)
    const ext = extFromUrl(thumbUrl)
    const dest = resolve(outDir, `${w.id}.${ext}`)
    await downloadImage(thumbUrl, dest)
  } catch (e) {
    console.log(`FAIL: ${e.message}`)
  }
}
