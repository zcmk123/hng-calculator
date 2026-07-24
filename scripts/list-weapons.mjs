/**
 * 从 src/data/weapons.ts 提取所有武器的 id + name + factiontemplateid + weaponcategoryid
 * 用 JSON.parse 精确解析，避免误匹配 modifiers 内的配件对象
 * 输出 scripts/weapon-list.json
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const src = readFileSync(resolve(root, 'src/data/weapons.ts'), 'utf8')

// 提取 = [...] 中的 JSON 数组文本
const eqIdx = src.indexOf('=')
const bracketStart = src.indexOf('[', eqIdx)
const bracketEnd = src.lastIndexOf(']')
const jsonText = src.slice(bracketStart, bracketEnd + 1)

const all = JSON.parse(jsonText)

// 只保留含 weaponcategoryid 的对象（武器），过滤掉配件（modifiers 内对象）
const weapons = all.filter((w) => w.weaponcategoryid !== undefined)

const results = weapons.map((w) => ({
  id: w.id,
  name: w.name,
  factiontemplateid: w.factiontemplateid,
  weaponcategoryid: w.weaponcategoryid,
}))

mkdirSync(resolve(__dirname), { recursive: true })
writeFileSync(resolve(__dirname, 'weapon-list.json'), JSON.stringify(results, null, 2))
console.log(`Written ${results.length} weapons to scripts/weapon-list.json`)
results.forEach((w) => console.log(`  ${w.id}\t${w.name}`))
