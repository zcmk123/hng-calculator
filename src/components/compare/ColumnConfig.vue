<script setup lang="ts">
/**
 * 对比页每列的弹药 + 配件配置。对应原 columnConfig()。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MOD_CATEGORIES, MOD_ORDER } from '@/lib/constants'
import type { Modifier, Weapon } from '@/types/weapon'

const props = defineProps<{
  weapon: Weapon
  ammoId: number
  modIds: number[]
}>()
const emit = defineEmits<{
  (e: 'update:ammo', id: number): void
  (e: 'update:mods', payload: { catModIds: number[]; id: number | '' }): void
}>()

const { t } = useI18n()

const ammoOptions = computed(() => [props.weapon.defaultAmmo, ...(props.weapon.ammunition || [])])

const modBlocks = computed<{ catId: number; mods: Modifier[] }[]>(() => {
  const cats: Record<number, Modifier[]> = {}
  ;(props.weapon.modifiers || []).forEach((m) => {
    ;(cats[m.weaponModCategoryId] ??= []).push(m)
  })
  return Object.keys(cats)
    .map(Number)
    .sort((a, b) => {
      const ia = MOD_ORDER.indexOf(a)
      const ib = MOD_ORDER.indexOf(b)
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a - b
    })
    .map((cid) => ({ catId: cid, mods: cats[cid] }))
})

function onAmmo(ev: Event) {
  emit('update:ammo', Number((ev.target as HTMLSelectElement).value))
}
function onMod(catMods: Modifier[], ev: Event) {
  const v = (ev.target as HTMLSelectElement).value
  emit('update:mods', { catModIds: catMods.map((m) => m.id), id: v === '' ? '' : Number(v) })
}
function selectedModValue(catMods: Modifier[]): string {
  const sel = catMods.find((m) => props.modIds.includes(m.id))
  return sel ? String(sel.id) : ''
}
</script>

<template>
  <div class="vs-config">
    <select class="vs-pick2" :value="ammoId" @change="onAmmo">
      <option v-for="(a, i) in ammoOptions" :key="a.id" :value="a.id">
        {{ a.name }}{{ i === 0 ? ` ${t('cfg.default')}` : '' }}
      </option>
    </select>
    <select
      v-for="blk in modBlocks"
      :key="blk.catId"
      class="vs-pick2"
      :value="selectedModValue(blk.mods)"
      @change="onMod(blk.mods, $event)"
    >
      <option value="">{{ t(MOD_CATEGORIES[blk.catId] || 'cfg.unknown') }}: {{ t('cfg.stock') }}</option>
      <option v-for="m in blk.mods" :key="m.id" :value="m.id">{{ m.name }}</option>
    </select>
  </div>
</template>

<style scoped lang="scss">
.vs-config {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}
.vs-pick2 {
  background: #12140d;
  border: 1px solid var(--line);
  color: var(--ink);
  padding: 4px 6px;
  border-radius: var(--radius);
  font-family: "JetBrains Mono";
  font-size: 11px;
  width: 100%;
}
</style>
