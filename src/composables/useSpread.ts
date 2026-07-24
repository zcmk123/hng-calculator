/**
 * 散布半径 / 比例计算 — 对应原 updateSpread() 中的读数逻辑。
 * coneRadius 从 compute.ts 复用。
 */
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { coneRadius } from '@/lib/compute'

export interface SpreadReadout {
  deg: number
  d: number
  r: number // ± m
  dia: number // m across
  cm: number // cm across
  pctVsTorso: number // % of 0.5 m torso
  pctVsStuart: number // % of 2.26 m Stuart height
}

export function useSpread(
  coneDeg: MaybeRefOrGetter<number>,
  range: MaybeRefOrGetter<number>,
) {
  return computed<SpreadReadout>(() => {
    const deg = toValue(coneDeg)
    const d = toValue(range)
    const r = coneRadius(deg, d)
    const dia = 2 * r
    return {
      deg,
      d,
      r,
      dia,
      cm: dia * 100,
      pctVsTorso: Math.round((dia / 0.5) * 100),
      pctVsStuart: Math.round((dia / 2.26) * 100),
    }
  })
}
