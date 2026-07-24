<script setup lang="ts">
/**
 * M5A1 Stuart 坦克剪影 + 散布圆。对应原 tankSVG() 函数。
 * M5A1 侧视 ≈ 4.34 m 长 × 2.26 m 高，作为车辆目标参考。
 * 所有 SVG 元素均通过 Vue 原生模板绑定，确保在 SVG 命名空间下创建。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ r: number }>()

const { t } = useI18n()

const VBW = 300
const VBH = 180
const L = 4.34
const Ht = 2.26

const geom = computed(() => {
  const r = props.r
  const sceneW = Math.max(L * 1.18, 2 * r * 1.3, 1.5)
  const k = VBW / sceneW
  const tankPxW = L * k
  const x0 = (VBW - tankPxW) / 2
  const base = (VBH + Ht * k) / 2
  const X = (m: number) => x0 + m * k
  const Y = (m: number) => base - m * k

  // range rings (4 concentric circles)
  const ringRadii = [1, 2, 3, 4].map(i => (VBH / 2) * i / 4)
  const ringCy = Y(1.1)
  const ringCx = VBW / 2

  // wheels: 0.65 → 3.7 step 0.72
  const wheelXs: number[] = []
  for (let wx = 0.65; wx <= 3.7; wx += 0.72) wheelXs.push(X(wx))
  const wheelY = Y(0.32)
  const wheelR = 0.26 * k

  // tracks
  const tracksX = X(0.15)
  const tracksY = Y(0.72)
  const tracksW = 4.05 * k
  const tracksH = 0.72 * k
  const tracksRx = 0.3 * k

  // hull polygon points
  const hullPoints = [
    [X(0.2), Y(0.72)],
    [X(0.2), Y(1.05)],
    [X(1.0), Y(1.5)],
    [X(4.15), Y(1.5)],
    [X(4.15), Y(0.72)],
  ].map(p => `${p[0]},${p[1]}`).join(' ')

  // turret polygon points
  const turretPoints = [
    [X(1.95), Y(1.5)],
    [X(2.15), Y(2.26)],
    [X(3.05), Y(2.26)],
    [X(3.2), Y(1.5)],
  ].map(p => `${p[0]},${p[1]}`).join(' ')

  // barrel
  const barrelX = X(0.5)
  const barrelY = Y(1.92)
  const barrelW = 1.7 * k
  const barrelH = 0.14 * k

  // spread disc
  const rr = r * k
  const ax = X(L / 2)
  const ay = Y(1.1)

  // scale bar
  const sbLen = 1 * k
  const sbX1 = 14
  const sbY = VBH - 10
  const sbX2 = 14 + sbLen
  const sbTextX = 14 + sbLen / 2
  const sbTextY = VBH - 16

  return {
    ringRadii, ringCx, ringCy,
    base,
    wheelXs, wheelY, wheelR,
    tracksX, tracksY, tracksW, tracksH, tracksRx,
    hullPoints, turretPoints,
    barrelX, barrelY, barrelW, barrelH,
    rr, ax, ay,
    sbX1, sbX2, sbY, sbTextX, sbTextY,
  }
})
</script>

<template>
  <div>
    <svg
      :viewBox="`0 0 ${VBW} ${VBH}`"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- range rings -->
      <circle
        v-for="(rad, i) in geom.ringRadii"
        :key="'ring' + i"
        :cx="geom.ringCx"
        :cy="geom.ringCy"
        :r="rad"
        fill="none"
        stroke="#ffffff08"
      />
      <!-- ground line -->
      <line
        :x1="8"
        :y1="geom.base"
        :x2="VBW - 8"
        :y2="geom.base"
        stroke="#ffffff12"
      />
      <!-- tracks -->
      <rect
        :x="geom.tracksX"
        :y="geom.tracksY"
        :width="geom.tracksW"
        :height="geom.tracksH"
        :rx="geom.tracksRx"
        fill="#4a4f38"
        stroke="#00000040"
        stroke-width="1"
      />
      <!-- wheels -->
      <circle
        v-for="(wx, i) in geom.wheelXs"
        :key="'wh' + i"
        :cx="wx"
        :cy="geom.wheelY"
        :r="geom.wheelR"
        fill="#3a3f2a"
        stroke="#00000040"
        stroke-width="1"
      />
      <!-- hull -->
      <polygon
        :points="geom.hullPoints"
        fill="#8a9a56"
        stroke="#00000040"
        stroke-width="1"
      />
      <!-- turret -->
      <polygon
        :points="geom.turretPoints"
        fill="#c9a24b"
        stroke="#00000040"
        stroke-width="1"
      />
      <!-- barrel -->
      <rect
        :x="geom.barrelX"
        :y="geom.barrelY"
        :width="geom.barrelW"
        :height="geom.barrelH"
        fill="#c9a24b"
        stroke="#00000040"
        stroke-width="1"
      />
      <!-- spread disc -->
      <circle
        :cx="geom.ax"
        :cy="geom.ay"
        :r="geom.rr"
        fill="#f4efdc22"
        stroke="#f4efdc"
        stroke-width="1.5"
      />
      <line
        :x1="geom.ax - geom.rr"
        :y1="geom.ay"
        :x2="geom.ax + geom.rr"
        :y2="geom.ay"
        stroke="#f4efdc"
        stroke-dasharray="2 3"
        opacity=".7"
      />
      <circle
        :cx="geom.ax"
        :cy="geom.ay"
        r="2.5"
        fill="var(--danger)"
      />
      <!-- scale bar -->
      <line
        :x1="geom.sbX1"
        :y1="geom.sbY"
        :x2="geom.sbX2"
        :y2="geom.sbY"
        stroke="var(--ink-faint)"
        stroke-width="2"
      />
      <text
        :x="geom.sbTextX"
        :y="geom.sbTextY"
        fill="var(--ink-faint)"
        font-size="10"
        text-anchor="middle"
        font-family="JetBrains Mono"
      >1 {{ t('unit.m') }}</text>
    </svg>
    <div class="hb-legend">
      <span class="on"><i style="background:#8a9a56"></i>M5A1 Stuart · 4.34 × 2.26 {{ t('unit.m') }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
svg {
  display: block;
  max-width: 280px;
  margin: 0 auto;
}
.hb-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-top: 4px;
  font-size: 10px;
  color: var(--ink-dim);
  text-align: center;
  justify-content: center;
}
.hb-legend span { display: inline-flex; align-items: center; gap: 3px; }
.hb-legend span.on { color: var(--ink); }
.hb-legend i {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
