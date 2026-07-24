/**
 * 当前武器配置 store：弹药 / 配件 / hitbox / 徽章 / 姿势 / 折叠状态。
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Cfg, Weapon } from '@/types/weapon'
import { WEAPONS } from '@/data/weapons'

export const useConfigStore = defineStore('config', () => {
  // 初始化为首件武器的默认弹药，避免 select 初始无选中项
  const ammoId = ref<number>(WEAPONS[0].defaultAmmo.id)
  const modIds = ref<number[]>([])
  const hitbox = ref<string>('torso')
  const heavyset = ref<string>('none')
  const fastReload = ref<string>('none')
  const ironFist = ref<string>('none')
  const grenadier = ref<string>('none')
  const stance = ref<string>('stand')

  // collapsible cfg-seg rows
  const cfgOpen = ref<Record<string, boolean>>({
    hitbox: true,
    heavyset: false,
    reload: false,
    ironfist: false,
    grenadier: false,
    stance: false,
  })

  /** Load ammo/mods from a weapon (used on weapon switch). */
  function fromWeapon(w: Weapon) {
    ammoId.value = w.defaultAmmo.id
    modIds.value = []
  }

  function setAmmo(id: number) {
    ammoId.value = id
  }

  /** Replace the mod in a category (each category is single-select). */
  function setMod(catModIds: number[], id: number | '') {
    modIds.value = modIds.value.filter((x) => !catModIds.includes(x))
    if (id !== '') modIds.value = [...modIds.value, Number(id)]
  }

  function reset(w: Weapon) {
    ammoId.value = w.defaultAmmo.id
    modIds.value = []
  }

  function toggleCfg(key: string) {
    cfgOpen.value = { ...cfgOpen.value, [key]: !cfgOpen.value[key] }
  }

  function asCfg(): Cfg {
    return {
      ammoId: ammoId.value,
      modIds: [...modIds.value],
      hitbox: hitbox.value,
      heavyset: heavyset.value,
      fastReload: fastReload.value,
      ironFist: ironFist.value,
      grenadier: grenadier.value,
      stance: stance.value,
    }
  }

  return {
    ammoId,
    modIds,
    hitbox,
    heavyset,
    fastReload,
    ironFist,
    grenadier,
    stance,
    cfgOpen,
    fromWeapon,
    setAmmo,
    setMod,
    reset,
    toggleCfg,
    asCfg,
  }
})
