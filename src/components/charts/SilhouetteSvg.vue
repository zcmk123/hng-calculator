<script setup lang="ts">
/**
 * 士兵剪影 + 散布圆。对应原 silhouetteSVG() 函数。
 * 圆心在胸口；按 hitbox 着色；选中 hitbox 用亮色描边。
 * 使用 Vue 原生模板绑定（非 v-html），确保 SVG 命名空间正确。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { HITBOX, HB_COLOR } from '@/lib/constants'

const props = defineProps<{
  r: number // ± metres at the current spread range
  selected: string // current hitbox id
}>()

const { t } = useI18n()

const VB = 210
const personH = 1.8

const g = computed(() => {
  const r = props.r
  const sceneM = Math.max(personH * 1.15, 2 * r * 1.25, 0.6)
  const k = VB / sceneM
  const cx = VB / 2
  const topY = (VB - personH * k) / 2
  const chestY = topY + 0.55 * personH * k
  const shoulderW = 0.52 * k
  const headR = 0.11 * k
  const T = (m: number) => topY + m * personH * k
  const M = (m: number) => m * personH * k

  return {
    cx,
    chestY,
    k,
    shoulderW,
    headR,
    rr: r * k,
    sbLen: 0.5 * k,
    // head
    headCx: cx,
    headCy: T(0.13),
    headRx: headR,
    headRy: headR * 1.15,
    // arms (left & right)
    armLx: cx - shoulderW * 0.62,
    armRx: cx + shoulderW * 0.46,
    armY: T(0.30),
    armW: shoulderW * 0.16,
    armH: M(0.34),
    // torso
    torsoD: `M ${cx - shoulderW / 2} ${T(0.30)} Q ${cx} ${T(0.26)} ${cx + shoulderW / 2} ${T(0.30)} L ${cx + shoulderW * 0.4} ${T(0.62)} L ${cx - shoulderW * 0.4} ${T(0.62)} Z`,
    // legs (left & right)
    legLx: cx - shoulderW * 0.4,
    legRx: cx + shoulderW * 0.04,
    legY: T(0.62),
    legW: shoulderW * 0.36,
    legH: M(0.38),
  }
})

function strokeOf(part: string): string {
  return props.selected === part ? '#f4efdc' : '#00000030'
}
function strokeWidthOf(part: string): number {
  return props.selected === part ? 2 : 1
}
</script>

<template>
  <div>
    <svg
      :viewBox="`0 0 ${VB} ${VB}`"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- range rings -->
      <circle
        v-for="i in 4"
        :key="i"
        :cx="g.cx"
        :cy="g.chestY"
        :r="(VB / 2) * i / 4"
        fill="none"
        stroke="#ffffff08"
      />

      <!-- head -->
      <ellipse
        :cx="g.headCx"
        :cy="g.headCy"
        :rx="g.headRx"
        :ry="g.headRy"
        :fill="HB_COLOR.head"
        :stroke="strokeOf('head')"
        :stroke-width="strokeWidthOf('head')"
      />

      <!-- arms -->
      <rect
        :x="g.armLx"
        :y="g.armY"
        :width="g.armW"
        :height="g.armH"
        rx="4"
        :fill="HB_COLOR.arms"
        :stroke="strokeOf('arms')"
        :stroke-width="strokeWidthOf('arms')"
      />
      <rect
        :x="g.armRx"
        :y="g.armY"
        :width="g.armW"
        :height="g.armH"
        rx="4"
        :fill="HB_COLOR.arms"
        :stroke="strokeOf('arms')"
        :stroke-width="strokeWidthOf('arms')"
      />

      <!-- torso -->
      <path
        :d="g.torsoD"
        :fill="HB_COLOR.torso"
        :stroke="strokeOf('torso')"
        :stroke-width="strokeWidthOf('torso')"
      />

      <!-- legs -->
      <rect
        :x="g.legLx"
        :y="g.legY"
        :width="g.legW"
        :height="g.legH"
        rx="4"
        :fill="HB_COLOR.legs"
        :stroke="strokeOf('legs')"
        :stroke-width="strokeWidthOf('legs')"
      />
      <rect
        :x="g.legRx"
        :y="g.legY"
        :width="g.legW"
        :height="g.legH"
        rx="4"
        :fill="HB_COLOR.legs"
        :stroke="strokeOf('legs')"
        :stroke-width="strokeWidthOf('legs')"
      />

      <!-- spread disc -->
      <circle
        :cx="g.cx"
        :cy="g.chestY"
        :r="g.rr"
        fill="#f4efdc22"
        stroke="#f4efdc"
        stroke-width="1.5"
      />
      <line
        :x1="g.cx - g.rr"
        :y1="g.chestY"
        :x2="g.cx + g.rr"
        :y2="g.chestY"
        stroke="#f4efdc"
        stroke-dasharray="2 3"
        opacity=".7"
      />
      <circle :cx="g.cx" :cy="g.chestY" r="2.5" fill="var(--danger)" />

      <!-- scale bar -->
      <line
        :x1="14"
        :y1="VB - 12"
        :x2="14 + g.sbLen"
        :y2="VB - 12"
        stroke="var(--ink-faint)"
        stroke-width="2"
      />
      <text
        :x="14 + g.sbLen / 2"
        :y="VB - 18"
        fill="var(--ink-faint)"
        font-size="10"
        text-anchor="middle"
        font-family="JetBrains Mono"
      >0.5 m</text>
    </svg>

    <div class="hb-legend">
      <span
        v-for="h in HITBOX"
        :key="h.id"
        :class="{ on: h.id === selected }"
      >
        <i :style="{ background: HB_COLOR[h.id] }"></i>{{ t(h.labelKey) }} ×{{ h.mult }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
svg {
  display: block;
  max-width: 200px;
  margin: 0 auto;
}
.hb-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-top: 4px;
  font-size: 10px;
  color: var(--ink-dim);
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
