<script setup lang="ts">
/**
 * 分段按钮组，对应原 seg() 函数。
 * items 的 label 字段是 i18n key，由本组件用 $t 翻译。
 */
import { useI18n } from 'vue-i18n'
import type { BadgeOption, HitboxOption, StanceOption } from '@/types/weapon'

type Item = HitboxOption | StanceOption | BadgeOption

const props = defineProps<{
  items: Item[]
  current: string
}>()
const emit = defineEmits<{ (e: 'pick', id: string): void }>()

const { t } = useI18n()
function label(it: Item): string {
  return t(it.labelKey)
}
function onPick(id: string) {
  emit('pick', id)
}
</script>

<template>
  <div class="seg">
    <button
      v-for="it in items"
      :key="it.id"
      :aria-pressed="it.id === current ? 'true' : 'false'"
      @click="onPick(it.id)"
    >
      {{ label(it) }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.seg { display: flex; flex-wrap: wrap; gap: 4px; }
.seg button {
  flex: 1 1 auto;
  background: #12140d;
  border: 1px solid var(--line);
  color: var(--ink-dim);
  padding: 6px 4px;
  font-size: 12px;
  border-radius: var(--radius);
  letter-spacing: .04em;
  min-width: 44px;
}
.seg button[aria-pressed="true"] {
  background: var(--brass);
  color: #161810;
  border-color: var(--brass);
  font-weight: 600;
}
</style>
