<script setup lang="ts">
/**
 * 后坐力轨迹图（单/双面板）。对应原 recoilSVG() 函数。
 * 当前 build 与 stock 不同 → 双面板；相同 → 单面板。
 * 使用 Vue 原生模板绑定 + i18n。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { recoilPattern, recoilChanged } from '@/lib/recoil'
import { fmt } from '@/lib/format'
import type { Stats } from '@/types/weapon'

const props = defineProps<{
  stats: Stats
  base?: Stats | null
}>()

const { t } = useI18n()

const W = 300
const H = 238
const botY = H - 30
const top = 26

const geom = computed(() => {
  const s = props.stats
  const base = props.base ?? null
  const n = Math.min(s.mag || 20, 25)
  const cur = recoilPattern(s, n)
  const changed = recoilChanged(s, base)
  const ref = changed && base ? recoilPattern(base, n) : null
  const all = ref ? cur.concat(ref) : cur
  const maxX = Math.max(0.04, ...all.map((p) => Math.abs(p.x)))
  const maxY = Math.max(0.04, ...all.map((p) => Math.abs(p.y)))
  const panelHW = changed ? 60 : 108
  const availH = botY - top - 4
  const scale = Math.min(panelHW / maxX, availH / maxY)

  // 每个面板的几何数据
  const buildPanel = (
    pts: { x: number; y: number }[],
    cx: number,
    color: string,
    label: string | null,
  ) => {
    const PX = (x: number) => cx + x * scale
    const PY = (y: number) => botY - y * scale
    return {
      rings: Array.from({ length: 3 }, (_, i) => ({
        x1: cx - panelHW,
        y1: botY - (availH * (i + 1)) / 3,
        x2: cx + panelHW,
        y2: botY - (availH * (i + 1)) / 3,
      })),
      centerX: cx,
      pts: pts.map((p) => ({ x: PX(p.x), y: PY(p.y) })),
      dots: pts.map((p, i) => ({ cx: PX(p.x), cy: PY(p.y), r: i === 0 ? 3.6 : 2.3, isfirst: i === 0 })),
      color,
      label,
      labelX: cx,
      labelY: top - 10,
    }
  }

  let panels: ReturnType<typeof buildPanel>[]
  let divider: boolean
  if (changed && ref) {
    panels = [
      buildPanel(ref, 78, 'var(--ink-faint)', t('spread.stock')),
      buildPanel(cur, 222, 'var(--brass)', t('spread.thisBuild')),
    ]
    divider = true
  } else {
    panels = [buildPanel(cur, 150, 'var(--brass)', null)]
    divider = false
  }

  return { panels, divider, n }
})

const note = computed(() =>
  t('spread.recoilNote', {
    n: geom.value.n,
    up: fmt(props.stats.recoilUp, 2),
    right: fmt(props.stats.recoilRight, 2),
    var: fmt(props.stats.recoilVar, 2),
  }),
)
</script>

<template>
  <div>
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <template v-for="(p, pi) in geom.panels" :key="pi">
        <!-- rings -->
        <line
          v-for="(r, ri) in p.rings"
          :key="ri"
          :x1="r.x1"
          :y1="r.y1"
          :x2="r.x2"
          :y2="r.y2"
          stroke="#ffffff08"
        />
        <!-- center line -->
        <line
          :x1="p.centerX"
          :y1="top"
          :x2="p.centerX"
          :y2="botY"
          stroke="#ffffff12"
        />
        <!-- trajectory polyline -->
        <polyline
          :points="p.pts.map(pt => pt.x.toFixed(1) + ',' + pt.y.toFixed(1)).join(' ')"
          fill="none"
          :stroke="p.color"
          stroke-width="1.6"
          opacity=".85"
        />
        <!-- shot dots -->
        <circle
          v-for="(d, di) in p.dots"
          :key="di"
          :cx="d.cx.toFixed(1)"
          :cy="d.cy.toFixed(1)"
          :r="d.r"
          :fill="d.isfirst ? 'var(--danger)' : p.color"
        />
        <!-- panel label -->
        <text
          v-if="p.label"
          :x="p.labelX"
          :y="p.labelY"
          :fill="p.color"
          font-size="11"
          text-anchor="middle"
          font-family="Oswald"
          letter-spacing="1"
        >{{ p.label }}</text>
      </template>

      <!-- divider between dual panels -->
      <line
        v-if="geom.divider"
        :x1="150"
        :y1="top - 6"
        :x2="150"
        :y2="botY + 6"
        stroke="#ffffff14"
      />
    </svg>
    <div class="rc-foot">
      <span class="rc-dot">●</span> {{ t('spread.recoilFoot') }}
    </div>
    <div class="rc-note">{{ note }}</div>
  </div>
</template>

<style scoped lang="scss">
svg {
  display: block;
  max-width: 280px;
  margin: 0 auto;
}
.rc-foot {
  margin-top: 4px;
  font-family: "JetBrains Mono";
  font-size: 10px;
  color: var(--ink-faint);
  text-align: center;
}
.rc-foot .rc-dot { color: var(--danger); }
.rc-note {
  margin-top: 2px;
  font-family: "JetBrains Mono";
  font-size: 10px;
  color: var(--ink-faint);
  text-align: center;
}
</style>
