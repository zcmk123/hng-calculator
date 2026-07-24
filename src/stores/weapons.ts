/**
 * 武器列表 store：选中、搜索、侧栏折叠状态。
 */
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { WEAPONS } from '@/data/weapons'
import type { Weapon } from '@/types/weapon'
import { CAT_MERGE } from '@/lib/constants'
import { groupOf } from '@/lib/classify'

export interface GroupedCat {
  cat: string
  items: Weapon[]
}
export interface GroupedFac {
  facKey: string
  facNameKey: string
  facColor: string
  cats: GroupedCat[] // empty for misc
  flatItems: Weapon[] | null // only for misc
}

export const useWeaponsStore = defineStore('weapons', () => {
  const all = WEAPONS
  const selectedId = ref<number>(WEAPONS[0].id)
  const search = ref('')
  const openFac = ref<Record<string, boolean>>({})
  const openCat = ref<Record<string, boolean>>({})

  const selectedWeapon = computed<Weapon>(
    () => all.find((w) => w.id === selectedId.value) ?? all[0],
  )

  const filteredWeapons = computed<Weapon[]>(() => {
    const f = search.value.trim().toLowerCase()
    if (!f) return all
    return all.filter((w) => w.name.toLowerCase().includes(f))
  })

  // 分组结构：realFacs 按 1/2/3 顺序，Misc 最后
  const groupedWeapons = computed<GroupedFac[]>(() => {
    const shown = filteredWeapons.value
    const misc = shown.filter((w) => groupOf(w).fac === 'misc')
    const realFacs: Record<string, Record<string, Weapon[]>> = {}
    shown
      .filter((w) => groupOf(w).fac !== 'misc')
      .forEach((w) => {
        const g = groupOf(w)
        ;(realFacs[g.fac] ??= {})[g.cat as string] ??= []
        realFacs[g.fac][g.cat as string].push(w)
      })

    const catOrder = (lbl: string): number => {
      const e = Object.values(CAT_MERGE).find((x) => x.label === lbl)
      return e ? e.order : 99
    }

    const out: GroupedFac[] = []
    Object.keys(realFacs)
      .sort()
      .forEach((fid) => {
        const facMeta = FACTION_LOOKUP[fid] || { nameKey: 'faction.misc', color: '#888' }
        const cats: GroupedCat[] = Object.keys(realFacs[fid])
          .sort((a, b) => catOrder(a) - catOrder(b) || a.localeCompare(b))
          .map((cat) => ({
            cat,
            items: [...realFacs[fid][cat]].sort((a, b) => a.name.localeCompare(b.name)),
          }))
        out.push({
          facKey: fid,
          facNameKey: facMeta.nameKey,
          facColor: facMeta.color,
          cats,
          flatItems: null,
        })
      })
    if (misc.length) {
      out.push({
        facKey: 'misc',
        facNameKey: 'faction.misc',
        facColor: '#8f8a6f',
        cats: [],
        flatItems: [...misc].sort((a, b) => a.name.localeCompare(b.name)),
      })
    }
    return out
  })

  function selectWeapon(id: number) {
    selectedId.value = id
    ensureVisible(id)
  }
  function setSearch(v: string) {
    search.value = v
  }
  function toggleFac(key: string) {
    openFac.value = { ...openFac.value, [key]: !openFac.value[key] }
  }
  function toggleCat(key: string) {
    openCat.value = { ...openCat.value, [key]: !openCat.value[key] }
  }
  function ensureVisible(id: number) {
    const w = all.find((x) => x.id === id)
    if (!w) return
    const g = groupOf(w)
    openFac.value = { ...openFac.value, [g.fac]: true }
    if (g.cat) openCat.value = { ...openCat.value, [g.fac + ':' + g.cat]: true }
  }

  // init: open the group holding the initially-selected weapon
  ensureVisible(selectedId.value)

  // 搜索时自动展开所有含匹配项的阵营与分类，让命中项可见（纯副作用，独立于 computed）
  watch(search, (v) => {
    const f = v.trim().toLowerCase()
    if (!f) return
    const facMap: Record<string, boolean> = { ...openFac.value }
    const catMap: Record<string, boolean> = { ...openCat.value }
    for (const w of WEAPONS) {
      if (!w.name.toLowerCase().includes(f)) continue
      const g = groupOf(w)
      facMap[g.fac] = true
      if (g.cat) catMap[g.fac + ':' + g.cat] = true
    }
    openFac.value = facMap
    openCat.value = catMap
  })

  return {
    all,
    selectedId,
    search,
    openFac,
    openCat,
    selectedWeapon,
    filteredWeapons,
    groupedWeapons,
    selectWeapon,
    setSearch,
    toggleFac,
    toggleCat,
    ensureVisible,
  }
})

// local faction lookup (avoids circular import with constants)
const FACTION_LOOKUP: Record<string, { nameKey: string; color: string }> = {
  '1': { nameKey: 'faction.us', color: '#a8b061' },
  '2': { nameKey: 'faction.ger', color: '#7f95a3' },
  '3': { nameKey: 'faction.sov', color: '#c05a45' },
  '0': { nameKey: 'faction.misc', color: '#8f8a6f' },
}
