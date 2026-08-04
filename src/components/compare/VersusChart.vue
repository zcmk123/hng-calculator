<script setup lang="ts">
/**
 * 对比页 multi-series 距离曲线图。对应原 versusChart() 函数。
 * 支持 damage / ttk 两种模式，多条曲线 + 共享 hover。
 * 所有 SVG 元素均通过 Vue 原生模板绑定，确保在 SVG 命名空间下创建。
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { niceStep, dmgAtRange } from '@/lib/compute'
import { TARGET_HP } from '@/lib/constants'
import type { Stats } from '@/types/weapon'

type Mode = 'damage' | 'ttk'

interface Series {
  name: string
  color: string
  s: Stats
}

const props = withDefaults(
  defineProps<{
    series: Series[]
    mode?: Mode
    title: string
    hitMul: number // hitbox * heavyset
  }>(),
  { mode: 'damage' },
)

const { t } = useI18n()

const W = 396
const H = 214
const pad = { l: 42, r: 8, t: 10, b: 24 }
const iw = W - pad.l - pad.r
const ih = H - pad.t - pad.b

const valAt = (s: Stats, d: number): number => {
  if (props.mode === 'damage') return dmgAtRange(s, d)
  const per = dmgAtRange(s, d) * props.hitMul
  const htk = Math.max(1, Math.ceil(TARGET_HP / per))
  return (htk - 1) * (60 / s.rpm) * 1000
}

interface YLine { y: number; label: string }
interface XLine { x: number; y1: number; y2: number; label: string }
interface SeriesPath { points: string; color: string }

const geom = computed(() => {
  const series = props.series
  const rawMaxD = Math.max(...series.map((x) => x.s.rFar)) * 1.4
  const xStep = niceStep(Math.max(rawMaxD, 60), 6)
  const maxD = Math.ceil(rawMaxD / xStep) * xStep

  let peak = 0
  series.forEach((x) => {
    for (let d = 0; d <= maxD; d += maxD / 60) peak = Math.max(peak, valAt(x.s, d))
  })
  const yStep =
    props.mode === 'damage' ? Math.max(10, niceStep(Math.max(peak, 10), 5)) : niceStep(Math.max(peak, 1), 5)
  const yMax = Math.max(yStep, Math.ceil(peak / yStep) * yStep)

  const X = (d: number) => pad.l + (d / maxD) * iw
  const Y = (v: number) => pad.t + ih - (Math.min(v, yMax) / yMax) * ih

  // gridlines + labels
  const yLines: YLine[] = []
  for (let v = 0; v <= yMax + 0.001; v += yStep) {
    yLines.push({ y: Y(v), label: String(v) })
  }
  const xLines: XLine[] = []
  for (let d = 0; d <= maxD + 0.001; d += xStep) {
    xLines.push({ x: X(d), y1: pad.t, y2: pad.t + ih, label: String(d) })
  }

  const yKill100 = Y(100)
  const showKillLine = props.mode === 'damage' && yKill100 > pad.t

  // one polyline per series (TTK = stepped)
  const lines: SeriesPath[] = series.map((x) => {
    const pts: string[] = []
    let prev: number | null = null
    for (let d = 0; d <= maxD; d += maxD / 220) {
      const v = valAt(x.s, d)
      if (props.mode === 'ttk' && prev !== null && v !== prev) {
        pts.push(`${X(d).toFixed(1)},${Y(prev).toFixed(1)}`)
      }
      pts.push(`${X(d).toFixed(1)},${Y(v).toFixed(1)}`)
      prev = v
    }
    return { points: pts.join(' '), color: x.color }
  })

  return { maxD, X, Y, yLines, xLines, showKillLine, yKill100, lines }
})

// hover state — show all series' dots + a multi-row tooltip
const svgRef = ref<SVGSVGElement | null>(null)
const tip = ref<{ left: number; dist: number; rows: { text: string; color: string; name: string }[]; show: boolean }>({
  left: 0, dist: 0, rows: [], show: false,
})
const crossX = ref<{ x: number; show: boolean }>({ x: 0, show: false })
const dots = ref<{ x: number; y: number; color: string; show: boolean }[]>(
  props.series.map(() => ({ x: 0, y: 0, color: '', show: false })),
)

function onMove(ev: MouseEvent | TouchEvent) {
  const svg = svgRef.value
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  const clientX = 'touches' in ev ? ev.touches[0]?.clientX ?? 0 : ev.clientX
  const px = clientX - rect.left
  const svgX = (px / rect.width) * W
  let d = ((svgX - pad.l) / iw) * geom.value.maxD
  d = Math.max(0, Math.min(geom.value.maxD, d))
  const vx = geom.value.X(d)
  crossX.value = { x: vx, show: true }
  const rows = props.series.map((x, i) => {
    const v = valAt(x.s, d)
    dots.value[i] = { x: vx, y: geom.value.Y(v), color: x.color, show: true }
    const text = props.mode === 'damage' ? v.toFixed(1) : `${Math.round(v)} ${t('unit.ms')}`
    return { text, color: x.color, name: x.name }
  })
  tip.value = {
    left: Math.min(rect.width - 150, px + 12),
    dist: Math.round(d),
    rows,
    show: true,
  }
}
function onLeave() {
  crossX.value.show = false
  dots.value = dots.value.map((d) => ({ ...d, show: false }))
  tip.value.show = false
}
</script>

<template>
  <div class="mini-chart">
    <div class="mini-title">{{ title }}</div>
    <div class="mc-plot">
      <svg
        ref="svgRef"
        :viewBox="`0 0 ${W} ${H}`"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        @mousemove="onMove"
        @mouseleave="onLeave"
        @touchmove="onMove"
        @touchend="onLeave"
      >
        <!-- y gridlines + labels -->
        <g>
          <template v-for="(yl, i) in geom.yLines" :key="'yl' + i">
            <line
              :x1="pad.l"
              :y1="yl.y"
              :x2="W - pad.r"
              :y2="yl.y"
              stroke="#ffffff10"
            />
            <text
              :x="pad.l - 5"
              :y="yl.y + 4"
              fill="#8a8770"
              font-size="12"
              text-anchor="end"
              font-family="JetBrains Mono"
            >{{ yl.label }}</text>
          </template>
        </g>
        <!-- x gridlines + labels -->
        <g>
          <template v-for="(xl, i) in geom.xLines" :key="'xl' + i">
            <line
              :x1="xl.x"
              :y1="xl.y1"
              :x2="xl.x"
              :y2="xl.y2"
              stroke="#ffffff08"
            />
            <text
              :x="xl.x"
              :y="H - 7"
              fill="#8a8770"
              font-size="12"
              text-anchor="middle"
              font-family="JetBrains Mono"
            >{{ xl.label }}</text>
          </template>
        </g>
        <!-- kill100 dashed line -->
        <line
          v-if="geom.showKillLine"
          :x1="pad.l"
          :y1="geom.yKill100"
          :x2="W - pad.r"
          :y2="geom.yKill100"
          stroke="#8a8770"
          stroke-dasharray="5 4"
        />
        <!-- series curves -->
        <polyline
          v-for="(sp, i) in geom.lines"
          :key="'sp' + i"
          :points="sp.points"
          fill="none"
          :stroke="sp.color"
          stroke-width="2"
        />
        <!-- crosshair -->
        <line
          v-if="crossX.show"
          :x1="crossX.x"
          :x2="crossX.x"
          :y1="pad.t"
          :y2="pad.t + ih"
          stroke="#f4efdc"
          stroke-width="1"
          opacity=".5"
        />
        <!-- series dots -->
        <template v-for="(d, i) in dots" :key="'dot' + i">
          <circle
            v-if="d.show"
            :cx="d.x"
            :cy="d.y"
            r="3.5"
            :fill="d.color"
          />
        </template>
      </svg>
      <div
        class="mc-tip"
        :style="{ opacity: tip.show ? 1 : 0, left: tip.left + 'px' }"
      >
        <b>{{ tip.dist }} {{ t('unit.m') }}</b>
        <div
          v-for="(r, i) in tip.rows"
          :key="i"
          :style="{ color: r.color }"
        >{{ r.text }} — {{ r.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mini-chart {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 8px;
}
.mini-title {
  font-size: 11px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--brass);
  margin-bottom: 4px;
}
.mc-plot { position: relative; }
.mc-tip {
  position: absolute;
  top: 6px;
  background: rgba(0, 0, 0, .75);
  border: 1px solid var(--line);
  color: var(--ink);
  padding: 3px 7px;
  font-family: "JetBrains Mono";
  font-size: 11px;
  pointer-events: none;
  border-radius: var(--radius);
}
.mc-tip b { display: block; color: var(--ink); margin-bottom: 2px; }
.mc-tip div { font-size: 10px; }
</style>
