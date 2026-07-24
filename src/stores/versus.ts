/**
 * 对比页 store：3 个对比槽 + 共享场景配置。
 */
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import type { VersusEntry } from '@/types/weapon'
import { WEAPONS } from '@/data/weapons'

export const useVersusStore = defineStore('versus', () => {
  // 3 slots; 3rd allows "none"
  const entries = ref<(VersusEntry | null)[]>([
    { wid: WEAPONS[0].id, ammoId: WEAPONS[0].defaultAmmo.id, modIds: [] },
    {
      wid: (WEAPONS[1] || WEAPONS[0]).id,
      ammoId: (WEAPONS[1] || WEAPONS[0]).defaultAmmo.id,
      modIds: [],
    },
    null,
  ])

  // shared scenario settings
  const vs = reactive({
    hitbox: 'torso',
    heavyset: 'none',
    fastReload: 'none',
    ironFist: 'none',
    grenadier: 'none',
    stance: 'stand',
  })

  function setEntry(idx: number, wid: number) {
    const w = WEAPONS.find((x) => x.id === wid)
    if (!w) return
    entries.value[idx] = { wid: w.id, ammoId: w.defaultAmmo.id, modIds: [] }
    entries.value = [...entries.value]
  }

  function clearEntry(idx: number) {
    entries.value[idx] = null
    entries.value = [...entries.value]
  }

  function setEntryAmmo(idx: number, ammoId: number) {
    const e = entries.value[idx]
    if (!e) return
    e.ammoId = ammoId
    entries.value = [...entries.value]
  }

  function setEntryMod(idx: number, catModIds: number[], id: number | '') {
    const e = entries.value[idx]
    if (!e) return
    e.modIds = e.modIds.filter((x) => !catModIds.includes(x))
    if (id !== '') e.modIds = [...e.modIds, Number(id)]
    entries.value = [...entries.value]
  }

  /** 批量替换某槽位的全部 modIds（用于"加入对比"时把当前详情配置一次性写入） */
  function setEntryMods(idx: number, modIds: number[]) {
    const e = entries.value[idx]
    if (!e) return
    e.modIds = [...modIds]
    entries.value = [...entries.value]
  }

  function setVs(key: keyof typeof vs, val: string) {
    ;(vs as Record<string, string>)[key] = val
  }

  return {
    entries,
    vs,
    setEntry,
    clearEntry,
    setEntryAmmo,
    setEntryMod,
    setEntryMods,
    setVs,
  }
})
