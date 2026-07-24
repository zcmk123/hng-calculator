<script setup lang="ts">
/**
 * 对比页武器选择 select（按阵营 optgroup）。对应原 weaponPicker()。
 * 第 3 槽允许 "none"。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWeaponsStore } from '@/stores/weapons'
import { FACTIONS } from '@/lib/constants'
import { groupOf } from '@/lib/classify'
import type { Weapon } from '@/types/weapon'

const props = defineProps<{
  modelValue: number | null // selected weapon id; null = empty (only valid for slot 3)
  allowNone?: boolean
}>()
const emit = defineEmits<{ (e: 'update:modelValue', id: number | null): void }>()

const { t } = useI18n()
const weapons = useWeaponsStore()

// group weapons by faction key (1/2/3/0); keep order 1,2,3,0 (misc last)
const groups = computed<{ facKey: string; label: string; items: Weapon[] }[]>(() => {
  const map: Record<string, Weapon[]> = {}
  weapons.all.forEach((w) => {
    const fk = String(w.factiontemplateid)
    ;(map[fk] ??= []).push(w)
  })
  // sort faction keys: 1, 2, 3, then 0 (misc) last
  const order = ['1', '2', '3', '0']
  return order
    .filter((k) => map[k])
    .map((k) => ({
      facKey: k,
      label: t((FACTIONS[Number(k)] || { name: 'faction.misc' }).name),
      items: [...map[k]].sort((a, b) => a.name.localeCompare(b.name)),
    }))
})

function onChange(ev: Event) {
  const v = (ev.target as HTMLSelectElement).value
  emit('update:modelValue', v === '' ? null : Number(v))
}
</script>

<template>
  <select class="vs-pick" :value="modelValue ?? ''" @change="onChange">
    <option v-if="allowNone" value="">{{ t('versus.none') }}</option>
    <optgroup v-for="g in groups" :key="g.facKey" :label="g.label">
      <option v-for="w in g.items" :key="w.id" :value="w.id">{{ w.name }}</option>
    </optgroup>
  </select>
</template>

<style scoped lang="scss">
.vs-pick {
  background: #12140d;
  border: 1px solid var(--line);
  color: var(--ink);
  padding: 5px 8px;
  border-radius: var(--radius);
  font-family: "JetBrains Mono";
  font-size: 12px;
  width: 100%;
  max-width: 220px;
}
</style>
