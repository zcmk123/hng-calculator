<script setup lang="ts">
/**
 * 战斗曲线（4 张图）。对应原 combatGraphs() 函数。
 * Damage / DPS / HTK / TTK 随距离变化，应用 hitbox + heavyset 倍率。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfigStore } from '@/stores/config'
import { useUiStore } from '@/stores/ui'
import { HITBOX, HEAVYSET, TARGET_HP } from '@/lib/constants'
import { dmgAtRange } from '@/lib/compute'
import type { Stats } from '@/types/weapon'
import MetricChart from '@/components/charts/MetricChart.vue'

const props = defineProps<{ stats: Stats }>()

const { t } = useI18n()
const config = useConfigStore()
const ui = useUiStore()

const mul = computed(() => {
  const hb = HITBOX.find((h) => h.id === config.hitbox)!.mult
  const hs = config.hitbox === 'head' ? 1 : HEAVYSET.find((h) => h.id === config.heavyset)!.mult
  return hb * hs
})

const dmg = (d: number) => dmgAtRange(props.stats, d) * mul.value
const dps = (d: number) => dmg(d) * props.stats.rpm / 60
const htk = (d: number) => Math.max(1, Math.ceil(TARGET_HP / dmg(d)))
const ttk = (d: number) => (htk(d) - 1) * (60 / props.stats.rpm) * 1000

const yInt = (v: number) => String(Math.round(v))

const legend = computed(() => {
  const hbLabel = t(`hitbox.${config.hitbox}`)
  const hs = config.heavyset !== 'none' ? ` · ${t('badge.hsShort')} ${t(`badge.${config.heavyset}`)}` : ''
  return t('curves.legendVs', { hitbox: hbLabel, heavyset: hs }) + ' · ' + t('curves.legend100')
})
</script>

<template>
  <div class="chartwrap">
    <div class="curves-title">{{ t('curves.title') }}</div>
    <div class="chart-legend"><span class="k">{{ legend }}</span></div>
    <div class="mini-grid">
      <MetricChart
        :title="t('curves.damage')"
        color="var(--danger)"
        :r-far="stats.rFar"
        :y-at="dmg"
        :y-fmt="yInt"
        kill100
      />
      <MetricChart
        :title="t('curves.dps')"
        color="#e07a2f"
        :r-far="stats.rFar"
        :y-at="dps"
        :y-fmt="yInt"
      />
      <MetricChart
        :title="t('curves.htk')"
        color="var(--good)"
        :r-far="stats.rFar"
        :y-at="htk"
        :y-fmt="yInt"
        stepped
      />
      <MetricChart
        :title="t('curves.ttk')"
        color="var(--brass)"
        :r-far="stats.rFar"
        :y-at="ttk"
        :y-fmt="yInt"
        stepped
      />
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
.curves-title {
  font-family: "Oswald";
  font-size: 12px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--brass);
  margin: 0 0 6px;
}
.chart-legend {
  font-size: 10px;
  color: var(--ink-faint);
  margin-bottom: 6px;
}
.mini-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}
</style>
