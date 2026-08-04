<script setup lang="ts">
/**
 * 对比视图：vs-presets（6 个共享 SegButtons）+ vs-area（表格 + 2 张 VersusChart）。
 * 对应原 renderVersus()。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVersusStore } from '@/stores/versus'
import { useWeaponsStore } from '@/stores/weapons'
import {
  CATEGORIES,
  FACTIONS,
  FASTRELOAD,
  GRENADIER,
  HEAVYSET,
  HITBOX,
  IRONFIST,
  STANCES,
  VS_PALETTE,
} from '@/lib/constants'
import { compute } from '@/lib/compute'
import { fmt } from '@/lib/format'
import type { Stats, Weapon } from '@/types/weapon'
import SegButtons from '@/components/common/SegButtons.vue'
import WeaponPicker from './WeaponPicker.vue'
import ColumnConfig from './ColumnConfig.vue'
import VersusChart from './VersusChart.vue'

const { t } = useI18n()
const versus = useVersusStore()
const weapons = useWeaponsStore()

// build per-column resolved weapons + stats
const cols = computed(() =>
  versus.entries.map((entry, i) => {
    if (!entry) return null
    const w = weapons.all.find((x) => x.id === entry.wid)
    if (!w) return null
    const s = compute(w, {
      ammoId: entry.ammoId,
      modIds: entry.modIds,
      hitbox: versus.vs.hitbox,
      heavyset: versus.vs.heavyset,
      fastReload: versus.vs.fastReload,
      ironFist: versus.vs.ironFist,
      grenadier: versus.vs.grenadier,
      stance: versus.vs.stance,
    })
    return { w, s, color: VS_PALETTE[i], entry, idx: i }
  }),
)

const validCols = computed(() => cols.value.filter((c): c is NonNullable<typeof c> => c !== null))

const hitMul = computed(() => {
  const hb = HITBOX.find((h) => h.id === versus.vs.hitbox)!.mult
  const hs = versus.vs.hitbox === 'head' ? 1 : HEAVYSET.find((h) => h.id === versus.vs.heavyset)!.mult
  return hb * hs
})

// coloured currency helpers — match in-game silver credits / gold
const cr = (n: number | string) => `<span class="cr">${n} cr</span>`
const gd = (n: number | string) => `<span class="gd">${n} g</span>`

// VS_GROUPS — grouped stat rows; "better" picks the winner for highlighting
type Row = {
  label: string
  text?: boolean
  unit?: string
  better?: 'up' | 'down'
  dd?: number
  get: (w: Weapon, s: Stats) => number | string
  disp?: (w: Weapon, s: Stats) => string
}
type Group = { title: string; rows: Row[] }

const VS_GROUPS: Group[] = [
  {
    title: t('versus.colWeapon'),
    rows: [
      {
        label: t('versus.colFaction'),
        text: true,
        get: (w) => t((FACTIONS[w.factiontemplateid] || { name: 'faction.misc' }).name),
      },
      {
        label: t('versus.colClass'),
        text: true,
        get: (w) => t(CATEGORIES[w.weaponcategoryid] || 'cat.unknown'),
      },
      {
        label: t('versus.colFireMode'),
        text: true,
        get: (w) =>
          w.fireModeAuto ? (w.fireModeSingle ? t('fireMode.select') : t('fireMode.auto')) : t('fireMode.semi'),
      },
    ],
  },
  {
    title: t('group.damage'),
    rows: [
      { label: t('stat.rateOfFire'), unit: t('unit.rpm'), better: 'up', get: (_w, s) => s.rpm, dd: 0 },
      {
        label: t('stat.effectiveDamage'),
        unit: t('unit.hp'),
        better: 'up',
        get: (_w, s) => s.effNear,
        dd: 0,
        disp: (_w, s) => `${fmt(s.effNear, 0)} → ${fmt(s.effFar, 0)}`,
      },
      {
        label: t('stat.dps'),
        unit: t('unit.hpPerS'),
        better: 'up',
        get: (_w, s) => s.dpsNear,
        dd: 0,
        disp: (_w, s) => `${fmt(s.dpsNear)} → ${fmt(s.dpsFar)}`,
      },
      {
        label: t('stat.htk'),
        better: 'down',
        get: (_w, s) => s.htkNear,
        dd: 0,
        disp: (_w, s) => `${s.htkNear} → ${s.htkFar}`,
      },
      {
        label: t('stat.ttk'),
        unit: t('unit.ms'),
        better: 'down',
        get: (_w, s) => s.ttkNear,
        dd: 0,
        disp: (_w, s) => `${fmt(s.ttkNear)} → ${fmt(s.ttkFar)}`,
      },
      { label: t('stat.magazine'), unit: t('unit.rds'), better: 'up', get: (_w, s) => s.mag, dd: 0 },
      { label: t('stat.mags'), better: 'up', get: (_w, s) => s.mags, dd: 0 },
      { label: t('stat.reload'), unit: t('unit.s'), better: 'down', get: (_w, s) => s.reload, dd: 2 },
      {
        label: t('stat.range'),
        unit: t('unit.m'),
        better: 'up',
        get: (_w, s) => s.rNear,
        dd: 0,
        disp: (_w, s) => `${fmt(s.rNear, 0)} → ${fmt(s.rFar, 0)}`,
      },
      { label: t('stat.maxRange'), unit: t('unit.m'), better: 'up', get: (_w, s) => s.rMax, dd: 0 },
      { label: t('stat.velocity'), unit: t('unit.mPerS'), better: 'up', get: (_w, s) => s.velocity, dd: 0 },
    ],
  },
  {
    title: t('group.armor'),
    rows: [
      {
        label: t('stat.armorDmg'),
        unit: t('unit.hp'),
        better: 'up',
        get: (_w, s) => (s.armorMin + s.armorMax) / 2,
        dd: 0,
        disp: (_w, s) => `${fmt(s.armorMin)}–${fmt(s.armorMax)}`,
      },
      { label: t('stat.armorDps'), unit: t('unit.hpPerS'), better: 'up', get: (_w, s) => s.armorDPS, dd: 0 },
      {
        label: t('stat.armorPenNear'),
        unit: t('unit.mm'),
        better: 'up',
        get: (_w, s) => (s.penMin + s.penMax) / 2,
        dd: 1,
        disp: (_w, s) => `${fmt(s.penMin, 1)}–${fmt(s.penMax, 1)}`,
      },
      {
        label: t('stat.armorPenFar'),
        unit: t('unit.mm'),
        better: 'up',
        get: (_w, s) => (s.penFarMin + s.penFarMax) / 2,
        dd: 1,
        disp: (_w, s) => `${fmt(s.penFarMin, 1)}–${fmt(s.penFarMax, 1)}`,
      },
      {
        label: t('stat.penRange'),
        unit: t('unit.m'),
        better: 'up',
        get: (_w, s) => s.penFarRange,
        dd: 0,
        disp: (_w, s) => `${fmt(s.penNearRange)}–${fmt(s.penFarRange)}`,
      },
    ],
  },
  {
    title: t('group.handling'),
    rows: [
      { label: t('stat.cone'), unit: t('unit.deg'), better: 'down', get: (_w, s) => s.cone, dd: 3 },
      {
        label: t('stat.recoilUp'),
        better: 'down',
        get: (_w, s) => s.recoilUp,
        dd: 3,
        disp: (_w, s) => `${fmt(s.recoilUp, 3)} / ${fmt(s.recoilRight, 3)}`,
      },
      { label: t('stat.recoilSpread'), better: 'down', get: (_w, s) => s.recoilVar, dd: 3 },
      { label: t('stat.bloom'), better: 'down', get: (_w, s) => s.bloom, dd: 2 },
      { label: t('stat.sway'), better: 'down', get: (_w, s) => s.sway, dd: 2 },
      { label: t('stat.swaySpeed'), better: 'down', get: (_w, s) => s.swayspeed, dd: 2 },
      { label: t('stat.swayFatigue'), better: 'down', get: (_w, s) => s.swayFatigue, dd: 2 },
      { label: t('stat.turnPenalty'), better: 'down', get: (_w, s) => s.turnPenalty, dd: 2 },
      { label: t('stat.equipTime'), unit: t('unit.s'), better: 'down', get: (_w, s) => s.equiptime, dd: 2 },
    ],
  },
  {
    title: t('group.economy'),
    rows: [
      { label: t('stat.ep'), better: 'down', get: (w) => w.equipmentPointsCost, dd: 0 },
      {
        label: t('stat.costPerShot'),
        better: 'down',
        get: (_w, s) => s.costPerShot,
        dd: 2,
        disp: (_w, s) => `${cr(fmt(s.costPerShot, 2))} ${gd(fmt(s.costPerShotG, 4))}`,
      },
      {
        label: t('stat.costPerMag'),
        better: 'down',
        get: (_w, s) => s.costPerMag,
        dd: 2,
        disp: (_w, s) => `${cr(fmt(s.costPerMag, 2))} ${gd(fmt(s.costPerMagG, 4))}`,
      },
      {
        label: t('stat.costToBuy'),
        better: 'down',
        get: (_w, s) => s.buy,
        dd: 0,
        disp: (_w, s) => `${cr(fmt(s.buy))} ${gd(fmt(s.buyG))}`,
      },
    ],
  },
]

function isBest(row: Row, idx: number): boolean {
  if (!row.better || validCols.value.length < 2) return false
  const vals = validCols.value.map((c) => Number(row.get(c.w, c.s)))
  const target = row.better === 'up' ? Math.max(...vals) : Math.min(...vals)
  return Math.abs(vals[idx] - target) < 1e-6
}

function cellText(row: Row, w: Weapon, s: Stats): string {
  if (row.text) return String(row.get(w, s))
  return row.disp ? row.disp(w, s) : fmt(Number(row.get(w, s)), row.dd ?? 0)
}

function cfgSummary(w: Weapon, entry: { ammoId: number; modIds: number[] }): string {
  const ammo = [w.defaultAmmo, ...(w.ammunition || [])].find((a) => a.id === entry.ammoId) || w.defaultAmmo
  const n = entry.modIds.length
  const isDef = ammo.id === w.defaultAmmo.id
  const parts: string[] = []
  if (!isDef) parts.push(ammo.name)
  if (n) parts.push(t('cfg.modsN', { n }))
  return parts.length ? parts.join(' · ') : t('cfg.stock')
}

function onPickWeapon(idx: number, id: number | null) {
  if (id === null) versus.clearEntry(idx)
  else versus.setEntry(idx, id)
}
function onPickAmmo(idx: number, id: number) {
  versus.setEntryAmmo(idx, id)
}
function onPickMods(idx: number, payload: { catModIds: number[]; id: number | '' }) {
  versus.setEntryMod(idx, payload.catModIds, payload.id)
}

const legend = computed(() => {
  const hbLabels = t(`hitbox.${versus.vs.hitbox}`)
  const hs = versus.vs.heavyset !== 'none' ? ` · ${t('badge.hsShort')} ${t(`badge.${versus.vs.heavyset}`)}` : ''
  return t('curves.legendVs', { hitbox: hbLabels, heavyset: hs })
})
</script>

<template>
  <div class="versusView">
    <!-- shared scenario bar — always-visible header, collapsible body -->
    <div class="vs-presetwrap" :class="{ closed: versus.vsBarClosed }">
      <div class="vs-presethead" @click="versus.toggleVsBar()">
        <span>{{ t('versus.scenarioBadges') }}</span>
        <span class="cur">▾</span>
      </div>
      <div class="vs-presets">
        <div class="vs-preset">
          <label>{{ t('versus.hitLocation') }}</label>
          <SegButtons :items="HITBOX" :current="versus.vs.hitbox" @pick="versus.setVs('hitbox', $event)" />
        </div>
        <div class="vs-preset">
          <label>{{ t('versus.heavySet') }}</label>
          <SegButtons :items="HEAVYSET" :current="versus.vs.heavyset" @pick="versus.setVs('heavyset', $event)" />
        </div>
        <div class="vs-preset">
          <label>{{ t('versus.fastReload') }}</label>
          <SegButtons :items="FASTRELOAD" :current="versus.vs.fastReload" @pick="versus.setVs('fastReload', $event)" />
        </div>
        <div class="vs-preset">
          <label>{{ t('versus.ironFist') }}</label>
          <SegButtons :items="IRONFIST" :current="versus.vs.ironFist" @pick="versus.setVs('ironFist', $event)" />
        </div>
        <div class="vs-preset">
          <label>{{ t('versus.grenadier') }}</label>
          <SegButtons :items="GRENADIER" :current="versus.vs.grenadier" @pick="versus.setVs('grenadier', $event)" />
        </div>
        <div class="vs-preset">
          <label>{{ t('versus.stance') }}</label>
          <SegButtons :items="STANCES" :current="versus.vs.stance" @pick="versus.setVs('stance', $event)" />
        </div>
      </div>
    </div>

    <div class="vs-area">
      <div class="vs-tablewrap">
        <table class="vs-table">
          <colgroup>
            <col class="vs-col-lbl" />
            <col class="vs-col" />
            <col class="vs-col" />
            <col class="vs-col" />
          </colgroup>
          <thead>
            <tr>
              <th class="vs-lbl"></th>
              <th v-for="i in 3" :key="i - 1" class="vs-head">
                <div class="vs-picktop">
                  <span class="vs-dot" :style="{ background: VS_PALETTE[i - 1] }"></span>
                  <WeaponPicker
                    :model-value="versus.entries[i - 1]?.wid ?? null"
                    :allow-none="i === 3"
                    @update:model-value="onPickWeapon(i - 1, $event)"
                  />
                </div>
                <ColumnConfig
                  v-if="versus.entries[i - 1]"
                  :weapon="weapons.all.find((x) => x.id === versus.entries[i - 1]!.wid)!"
                  :ammo-id="versus.entries[i - 1]!.ammoId"
                  :mod-ids="versus.entries[i - 1]!.modIds"
                  @update:ammo="onPickAmmo(i - 1, $event)"
                  @update:mods="onPickMods(i - 1, $event)"
                />
              </th>
            </tr>
          </thead>
          <tbody v-if="validCols.length >= 2">
            <template v-for="(g, gi) in VS_GROUPS" :key="gi">
              <tr class="vs-grouprow" :class="{ closed: versus.isVsGroupClosed(g.title) }"
                @click="versus.toggleVsGroup(g.title)">
                <td class="vs-grouplbl" :colspan="1 + validCols.length">
                  <span class="cur">▾</span> {{ g.title }}
                </td>
              </tr>
              <template v-if="!versus.isVsGroupClosed(g.title)">
                <tr v-for="(row, ri) in g.rows" :key="gi + '-' + ri">
                  <td class="vs-lbl">{{ row.label }}</td>
                  <td
                    v-for="(c, ci) in validCols"
                    :key="ci"
                    :class="{ 'vs-win': isBest(row, ci), 'vs-text': row.text }"
                  >
                    <span v-if="row.text">{{ cellText(row, c.w, c.s) }}</span>
                    <span v-else v-html="cellText(row, c.w, c.s) + (row.unit ? ` <small>${row.unit}</small>` : '')"></span>
                  </td>
                  <td v-for="k in 3 - validCols.length" :key="'pad-' + k" class="vs-empty"></td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>

        <div v-if="validCols.length < 2" class="hint">{{ t('versus.selectTwo') }}</div>
      </div>

      <div v-if="validCols.length >= 2" class="vs-charts">
        <div class="curves-title">{{ t('versus.combatCurves') }}</div>
        <div class="chartwrap">
          <div class="chart-legend">
            <span
              v-for="c in validCols"
              :key="c.idx"
              class="k"
            >
              <span class="sw" :style="{ background: c.color }"></span>{{ c.w.name }}
            </span>
            <span class="k dim">{{ legend }}</span>
          </div>
          <div class="mini-grid">
            <VersusChart :series="validCols.map((c) => ({ name: c.w.name, color: c.color, s: c.s }))" mode="damage" :title="t('curves.damage')" :hit-mul="hitMul" />
            <VersusChart :series="validCols.map((c) => ({ name: c.w.name, color: c.color, s: c.s }))" mode="ttk" :title="t('curves.ttk')" :hit-mul="hitMul" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.versusView { display: flex; flex-direction: column; gap: 16px; }

.vs-presetwrap {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
}
.vs-presethead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 14px;
  cursor: pointer;
  user-select: none;
  font-family: "Oswald";
  text-transform: uppercase;
  letter-spacing: .12em;
  font-size: 12px;
  color: var(--brass);
}
.vs-presethead .cur { transition: transform .12s; font-size: 10px; }
.vs-presetwrap.closed .cur { transform: rotate(-90deg); }
.vs-presetwrap.closed .vs-presets { display: none; }

.vs-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  padding: 4px 14px 14px;
}
.vs-preset { display: flex; flex-direction: column; gap: 4px; min-width: 180px; }
.vs-preset label {
  font-size: 10px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

.vs-area {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 16px;
  align-items: flex-start;
}
@media (max-width: 1180px) {
  .vs-area { grid-template-columns: 1fr; }
}

.vs-tablewrap { overflow-x: auto; }
.vs-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.vs-table th,
.vs-table td {
  padding: 6px 8px;
  border-bottom: 1px solid var(--line);
  text-align: right;
  white-space: nowrap;
}
.vs-table th:first-child,
.vs-table td:first-child { text-align: left; }
.vs-lbl {
  font-family: "Oswald";
  text-transform: uppercase;
  letter-spacing: .08em;
  font-size: 11px;
  color: var(--ink-dim);
}
.vs-head { vertical-align: top; background: var(--panel-2); }
.vs-picktop { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.vs-dot { display: inline-block; width: 9px; height: 9px; border-radius: 2px; flex: 0 0 auto; }
.vs-grouprow { background: var(--panel-2); }
.vs-grouprow .vs-grouplbl { cursor: pointer; user-select: none; }
.vs-grouprow .cur { display: inline-block; font-size: 9px; transition: transform .12s; color: var(--brass); margin-right: 4px; }
.vs-grouprow.closed .cur { transform: rotate(-90deg); }
.vs-grouprow:hover .vs-grouplbl { color: var(--ink); }
.vs-grouplbl {
  font-family: "Oswald";
  text-transform: uppercase;
  letter-spacing: .14em;
  font-size: 11px;
  color: var(--brass);
}
.vs-win { color: var(--good); font-weight: 600; }
.vs-text { color: var(--ink-dim); }
.vs-empty { background: transparent; }
.vs-table td small { color: var(--ink-faint); font-size: 10px; }

.vs-charts { display: flex; flex-direction: column; gap: 6px; }
.curves-title {
  font-family: "Oswald";
  font-size: 12px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--brass);
}
.chartwrap {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 8px;
}
.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  font-size: 10px;
  color: var(--ink-dim);
  margin-bottom: 6px;
}
.chart-legend .k { display: inline-flex; align-items: center; gap: 4px; }
.chart-legend .k.dim { color: var(--ink-faint); }
.chart-legend .sw { display: inline-block; width: 9px; height: 9px; border-radius: 2px; }
.mini-grid { display: grid; grid-template-columns: 1fr; gap: 6px; }

.hint { font-size: 12px; color: var(--ink-faint); margin-top: 4px; line-height: 1.4; }
</style>
