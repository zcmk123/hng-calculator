/**
 * compute() 的响应式封装：基于 weapon + cfg 自动重新计算。
 */
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { Cfg, Stats, Weapon } from '@/types/weapon'
import { compute } from '@/lib/compute'

export function useCompute(
  weapon: MaybeRefOrGetter<Weapon | undefined>,
  cfg: MaybeRefOrGetter<Cfg>,
) {
  return computed<Stats | null>(() => {
    const w = toValue(weapon)
    if (!w) return null
    return compute(w, toValue(cfg))
  })
}
