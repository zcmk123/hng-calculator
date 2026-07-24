<script setup lang="ts">
/**
 * 通用距离曲线图（hover 读数）。对应原 metricChart() 函数。
 * 用 svg + ref + reactive 复刻 mousemove/touchmove 行为。
 * 所有 SVG 元素均通过 Vue 原生模板绑定，确保在 SVG 命名空间下创建。
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { niceStep } from '@/lib/compute'

const props = withDefaults(
  defineProps<{
    title: string
    color: string
    yAt: (d: number) => number
    maxD?: number
    rFar: number // required by original metricChart; used to compute default maxD
    stepped?: boolean
    kill100?: boolean
    yFmt?: (v: number) => string
  }>(),
  { stepped: false, kill100: false },
)

const { t } = useI18n()

const W = 340
const H = 168
const pad = { l: 40, r: 10, t: 12, b: 26 }
const iw = W - pad.l - pad.r
const ih = H - pad.t - pad.b

interface YLine { y: number; label: string }
interface XLabel { x: number; label: string }

const geometry = computed(() => {
  const rawMaxD = props.maxD || Math.max(props.rFar * 1.5, 60)
  const xStep = niceStep(rawMaxD, 5)
  const maxD = Math.ceil(rawMaxD / xStep) * xStep
  let peak = 0
  for (let d = 0; d <= maxD; d += maxD / 60) peak = Math.max(peak, props.yAt(d))
  const yStep = niceStep(Math.max(peak, 1), 4)
  const yMax = Math.max(yStep, Math.ceil(peak / yStep) * yStep)
  const X = (d: number) => pad.l + (d / maxD) * iw
  const Y = (v: number) => pad.t + ih - (Math.min(v, yMax) / yMax) * ih

  // build path (stepped for integer metrics like HTK/TTK)
  const pts: string[] = []
  let prev: { v: number } | null = null
  for (let d = 0; d <= maxD; d += maxD / 200) {
    const v = props.yAt(d)
    if (props.stepped && prev !== null && v !== prev.v) {
      pts.push(`${X(d).toFixed(1)},${Y(prev.v).toFixed(1)}`)
    }
    pts.push(`${X(d).toFixed(1)},${Y(v).toFixed(1)}`)
    prev = { v }
  }

  // y-axis labels & horizontal gridlines
  const yLines: YLine[] = []
  for (let v = 0; v <= yMax + 0.001; v += yStep) {
    const lbl = props.yFmt ? props.yFmt(v) : String(v)
    yLines.push({ y: Y(v), label: lbl })
  }
  // x-axis labels
  const xLabels: XLabel[] = []
  for (let d = 0; d <= maxD + 0.001; d += xStep) {
    xLabels.push({ x: X(d), label: String(d) })
  }

  const yKill100 = Y(100)
  const showKillLine =
    props.kill100 && yKill100 > pad.t && yKill100 < pad.t + ih

  return { maxD, X, Y, pathPoints: pts.join(' '), yLines, xLabels, showKillLine, yKill100 }
})

// hover state
const svgRef = ref<SVGSVGElement | null>(null)
const tip = ref<{ left: number; dist: number; val: string; show: boolean }>({ left: 0, dist: 0, val: '', show: false })
const cross = ref<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false })

function fmtVal(v: number): string {
  return props.yFmt ? props.yFmt(v) : String(Math.round(v))
}

function onMove(ev: MouseEvent | TouchEvent) {
  const svg = svgRef.value
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  const clientX = 'touches' in ev ? ev.touches[0]?.clientX ?? 0 : ev.clientX
  const px = clientX - rect.left
  let d = ((px / rect.width) * W - pad.l) / iw
  d = Math.max(0, Math.min(geometry.value.maxD, d))
  const v = props.yAt(d)
  const vx = geometry.value.X(d)
  cross.value = { x: vx, y: geometry.value.Y(v), show: true }
  tip.value = {
    left: Math.min(rect.width - 70, px + 10),
    dist: Math.round(d),
    val: fmtVal(v),
    show: true,
  }
}
function onLeave() {
  cross.value.show = false
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
        <!-- gridlines + y labels -->
        <g>
          <template v-for="(yl, i) in geometry.yLines" :key="'yl' + i">
            <line
              :x1="pad.l"
              :y1="yl.y"
              :x2="W - pad.r"
              :y2="yl.y"
              stroke="#ffffff0e"
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
        <!-- x labels -->
        <g>
          <text
            v-for="(xl, i) in geometry.xLabels"
            :key="'xl' + i"
            :x="xl.x"
            :y="H - 8"
            fill="#8a8770"
            font-size="12"
            text-anchor="middle"
            font-family="JetBrains Mono"
          >{{ xl.label }}</text>
        </g>
        <!-- kill100 dashed line -->
        <line
          v-if="geometry.showKillLine"
          :x1="pad.l"
          :y1="geometry.yKill100"
          :x2="W - pad.r"
          :y2="geometry.yKill100"
          stroke="#8a8770"
          stroke-dasharray="4 3"
          opacity=".8"
        />
        <!-- main curve -->
        <polyline
          :points="geometry.pathPoints"
          fill="none"
          :stroke="color"
          stroke-width="2.5"
        />
        <!-- crosshair + dot -->
        <g v-show="cross.show">
          <line
            :x1="cross.x"
            :x2="cross.x"
            :y1="pad.t"
            :y2="pad.t + ih"
            stroke="#f4efdc"
            stroke-width="1"
            opacity=".5"
          />
          <circle :cx="cross.x" :cy="cross.y" r="3.5" :fill="color" />
        </g>
      </svg>
      <div
        class="mc-tip"
        :style="{ opacity: tip.show ? 1 : 0, left: tip.left + 'px' }"
      >{{ tip.dist }}{{ t('unit.m') }} · <b>{{ tip.val }}</b></div>
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
</style>
