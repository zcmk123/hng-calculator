<script setup lang="ts">
/**
 * 武器列表表格视图。对应原 renderTable()。
 * 列头点击排序；行点击进入数据面板。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useWeaponsStore } from '@/stores/weapons'
import { useConfigStore } from '@/stores/config'
import { useUiStore } from '@/stores/ui'
import { FACTIONS } from '@/lib/constants'
import { compute } from '@/lib/compute'
import { fmt } from '@/lib/format'
import type { Weapon } from '@/types/weapon'

const { t } = useI18n()
const weapons = useWeaponsStore()
const config = useConfigStore()
const ui = useUiStore()
const router = useRouter()

// All weapons at stock, torso hit, no Heavy Set (matches legacy renderTable).
const rows = computed(() =>
  weapons.all.map((w) => ({
    w,
    s: compute(w, {
      ammoId: w.defaultAmmo.id,
      modIds: [],
      hitbox: 'torso',
      heavyset: 'none',
      fastReload: 'none',
      ironFist: 'none',
      grenadier: 'none',
      stance: 'aim',
    }),
  })),
)

interface Col {
  k: string
  labelKey: string
  num: boolean
  get: (w: Weapon, s: ReturnType<typeof compute>) => string | number
  dd?: number // decimals for fmt
}

const TCOLS: Col[] = [
  { k: 'name', labelKey: 'table.cols.weapon', num: false, get: (w) => w.name },
  { k: 'rpm', labelKey: 'table.cols.rpm', num: true, get: (_w, s) => s.rpm },
  { k: 'dmgNear', labelKey: 'table.cols.dmg', num: true, get: (_w, s) => s.dmgNear, dd: 0 },
  { k: 'dpsNear', labelKey: 'table.cols.dps', num: true, get: (_w, s) => s.dpsNear },
  { k: 'htkNear', labelKey: 'table.cols.htk', num: true, get: (_w, s) => s.htkNear },
  { k: 'ttkNear', labelKey: 'table.cols.ttk', num: true, get: (_w, s) => s.ttkNear },
  { k: 'velocity', labelKey: 'table.cols.velocity', num: true, get: (_w, s) => s.velocity },
  { k: 'rFar', labelKey: 'table.cols.far', num: true, get: (_w, s) => s.rFar, dd: 0 },
  { k: 'recoilUp', labelKey: 'table.cols.recoilUp', num: true, get: (_w, s) => s.recoilUp, dd: 3 },
  { k: 'cone', labelKey: 'table.cols.cone', num: true, get: (_w, s) => s.cone, dd: 3 },
  { k: 'mag', labelKey: 'table.cols.mag', num: true, get: (_w, s) => s.mag },
  { k: 'ep', labelKey: 'table.cols.ep', num: true, get: (w) => w.equipmentPointsCost },
]

const sortedRows = computed(() => {
  const { key, dir } = ui.sort
  const col = TCOLS.find((c) => c.k === key) || TCOLS[0]
  return [...rows.value].sort((a, b) => {
    const av = col.get(a.w, a.s)
    const bv = col.get(b.w, b.s)
    const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
    return cmp * dir
  })
})

function ariaSort(k: string): 'ascending' | 'descending' | undefined {
  if (ui.sort.key !== k) return undefined
  return ui.sort.dir > 0 ? 'ascending' : 'descending'
}

function onHeaderClick(c: Col) {
  ui.setSort(c.k, c.num)
}

function fmtVal(c: Col, w: Weapon, s: ReturnType<typeof compute>): string {
  const v = c.get(w, s)
  if (typeof v === 'string') return v
  return fmt(v, c.dd ?? 0)
}

function facColor(w: Weapon): string {
  return (FACTIONS[w.factiontemplateid] || {}).color || '#888'
}

function onSelect(w: Weapon) {
  weapons.selectWeapon(w.id)
  config.fromWeapon(w)
  router.push('/detail')
}
</script>

<template>
  <div>
    <div class="notice">
      <b>{{ t('table.notice') }}</b> — {{ t('table.noticeBody') }}
    </div>

    <table class="cmpTable">
      <thead>
        <tr>
          <th
            v-for="c in TCOLS"
            :key="c.k"
            :aria-sort="ariaSort(c.k)"
            @click="onHeaderClick(c)"
          >
            {{ t(c.labelKey) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="{ w, s } in sortedRows"
          :key="w.id"
          @click="onSelect(w)"
        >
          <td>
            <span class="faction-dot" :style="{ background: facColor(w) }"></span>{{ w.name }}
          </td>
          <td v-for="c in TCOLS.slice(1)" :key="c.k">{{ fmtVal(c, w, s) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
