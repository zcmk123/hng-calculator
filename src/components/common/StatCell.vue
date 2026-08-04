<script setup lang="ts">
/**
 * 单数据 cell，对应原 cell() 函数。
 * k = 标签（已翻译） / v = 主值（HTML 字符串，可含 →） / unit = 单位
 * delta = 与 stock 的差值；betterWhenUp = true 时 delta>0 为好（绿）。
 */
import { computed } from 'vue'
import { fmt } from '@/lib/format'

const props = defineProps<{
  k: string
  v: string | number
  unit?: string
  hot?: boolean
  kill?: boolean
  delta?: number
  betterWhenUp?: boolean
  dd?: number
  w?: 'n' | 'w'
}>()

const deltaHtml = computed(() => {
  if (props.delta == null || Math.abs(props.delta) <= 0.0005) return ''
  const up = props.delta > 0
  const good = props.betterWhenUp ? up : !up
  const arrow = up ? '▲' : '▼'
  return `<span class="delta ${good ? 'up' : 'down'}">${arrow}${fmt(Math.abs(props.delta), props.dd ?? 0)}</span>`
})
</script>

<template>
  <div class="cell" :class="{ hot, kill, 'cell-n': w === 'n', 'cell-w': w === 'w' }">
    <div class="k">{{ k }}</div>
    <div class="v">
      <span v-html="v"></span>
      <small v-if="unit"> {{ unit }}</small>
      <span v-if="deltaHtml" v-html="deltaHtml"></span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cell {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 6px 8px;
  flex: 1 1 118px;
  min-width: 118px;
}
.cell-n { flex: 1 1 92px; min-width: 92px; }
.cell-w { flex: 2 1 150px; min-width: 150px; }
.cell .k {
  font-size: 10px;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: var(--ink-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cell .v {
  font-family: "JetBrains Mono";
  font-size: 16px;
  font-weight: 500;
  margin-top: 2px;
}
.cell .v small {
  font-size: 10px;
  color: var(--ink-dim);
  font-weight: 400;
}
.cell.hot .v { color: var(--brass); }
.cell.kill .v { color: var(--danger); }
.delta { font-family: "JetBrains Mono"; font-size: 10px; margin-left: 5px; }
.delta.up { color: var(--good); }
.delta.down { color: var(--danger); }
</style>
