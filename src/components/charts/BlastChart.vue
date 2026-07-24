<script setup lang="ts">
/**
 * 爆炸伤害衰减图（从中心线性衰减到 0）。对应原 blastChart() 函数。
 * 内部使用 MetricChart 绘制曲线。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { fmt } from '@/lib/format'
import MetricChart from './MetricChart.vue'

const props = defineProps<{
  explDmg: number
  radius: number
  killR: number
}>()

const { t } = useI18n()

const dmgAt = (r: number) => Math.max(0, props.explDmg * (1 - r / props.radius))
const yFmt = (v: number) => v.toFixed(0)

const legend = computed(
  () =>
    `${t('chart.metresFromCentre')} · ${t('chart.dashedHp')} · ${t('chart.killRadius')} ${fmt(props.killR, 2)} m`,
)
</script>

<template>
  <div class="chartwrap">
    <MetricChart
      :title="t('chart.damageFromCentre')"
      color="var(--danger)"
      :r-far="radius"
      :max-d="radius"
      :y-at="dmgAt"
      :y-fmt="yFmt"
      kill100
    />
    <div class="chart-legend">
      <span class="k">{{ legend }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chartwrap {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 8px;
}
.chart-legend {
  margin-top: 4px;
  font-size: 10px;
  color: var(--ink-faint);
}
</style>
