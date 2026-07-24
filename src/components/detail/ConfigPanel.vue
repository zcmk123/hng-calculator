<script setup lang="ts">
/**
 * 配置面板：弹药 select + 配件 blocks + 6 个 SegButtons + Reset / Compare。
 * 对应原 renderDetail() 中的 cfg 部分。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfigStore } from '@/stores/config'
import { useWeaponsStore } from '@/stores/weapons'
import { FASTRELOAD, GRENADIER, HEAVYSET, HITBOX, IRONFIST, MOD_CATEGORIES, MOD_ORDER, STANCES } from '@/lib/constants'
import { itemKind } from '@/lib/classify'
import type { Modifier, Weapon } from '@/types/weapon'
import SegButtons from '@/components/common/SegButtons.vue'

const props = defineProps<{ weapon: Weapon }>()
const emit = defineEmits<{ (e: 'reset'): void; (e: 'compare'): void }>()

const { t } = useI18n()
const config = useConfigStore()
const weapons = useWeaponsStore()

// ammo options: default + alternatives
const ammoOptions = computed(() => [props.weapon.defaultAmmo, ...(props.weapon.ammunition || [])])

// group mods by category, then sort by MOD_ORDER
const modBlocks = computed<{ catId: number; mods: Modifier[] }[]>(() => {
  const cats: Record<number, Modifier[]> = {}
  ;(props.weapon.modifiers || []).forEach((m) => {
    ;(cats[m.weaponModCategoryId] ??= []).push(m)
  })
  return Object.keys(cats)
    .map(Number)
    .sort((a, b) => {
      const ia = MOD_ORDER.indexOf(a)
      const ib = MOD_ORDER.indexOf(b)
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a - b
    })
    .map((cid) => ({ catId: cid, mods: cats[cid] }))
})

const kind = computed(() => itemKind(props.weapon))

function isModSelected(m: Modifier): boolean {
  return config.modIds.includes(m.id)
}
function onModChange(catMods: Modifier[], ev: Event) {
  const val = (ev.target as HTMLSelectElement).value
  const ids = catMods.map((m) => m.id)
  config.setMod(ids, val === '' ? '' : Number(val))
}
function selectedModValue(catMods: Modifier[]): string {
  const sel = catMods.find((m) => config.modIds.includes(m.id))
  return sel ? String(sel.id) : ''
}
</script>

<template>
  <aside class="cfg-col">
    <!-- ammo -->
    <div class="cfg-sel">
      <label>{{ t('cfg.ammo') }}</label>
      <select :value="config.ammoId" @change="config.setAmmo(Number(($event.target as HTMLSelectElement).value))">
        <option v-for="(a, i) in ammoOptions" :key="a.id" :value="a.id">
          {{ a.name }}{{ i === 0 ? ` ${t('cfg.default')}` : '' }}
        </option>
      </select>
    </div>

    <!-- mod blocks -->
    <div
      v-for="blk in modBlocks"
      :key="blk.catId"
      class="cfg-sel"
    >
      <label>{{ t(MOD_CATEGORIES[blk.catId] || 'cfg.unknown') }}</label>
      <select
        :value="selectedModValue(blk.mods)"
        @change="onModChange(blk.mods, $event)"
      >
        <option value="">{{ t('cfg.stock') }}</option>
        <option
          v-for="m in blk.mods"
          :key="m.id"
          :value="m.id"
        >
          {{ m.name }}
        </option>
      </select>
    </div>

    <!-- 6 preset rows (collapsible) -->
    <div class="cfg-seg" :class="{ closed: !config.cfgOpen.hitbox }" data-key="hitbox">
      <label @click="config.toggleCfg('hitbox')">{{ t('cfg.hitbox') }}</label>
      <SegButtons :items="HITBOX" :current="config.hitbox" @pick="config.hitbox = $event" />
    </div>

    <div class="cfg-seg" :class="{ closed: !config.cfgOpen.heavyset }" data-key="heavyset">
      <label @click="config.toggleCfg('heavyset')">{{ t('cfg.heavyset') }}</label>
      <SegButtons :items="HEAVYSET" :current="config.heavyset" @pick="config.heavyset = $event" />
    </div>

    <div class="cfg-seg" :class="{ closed: !config.cfgOpen.reload }" data-key="reload">
      <label @click="config.toggleCfg('reload')">{{ t('cfg.fastReload') }}</label>
      <SegButtons :items="FASTRELOAD" :current="config.fastReload ?? 'none'" @pick="config.fastReload = $event" />
    </div>

    <div class="cfg-seg" :class="{ closed: !config.cfgOpen.ironfist }" data-key="ironfist">
      <label @click="config.toggleCfg('ironfist')">{{ t('cfg.ironFist') }}</label>
      <SegButtons :items="IRONFIST" :current="config.ironFist ?? 'none'" @pick="config.ironFist = $event" />
    </div>

    <div
      v-if="kind === 'explosive'"
      class="cfg-seg"
      :class="{ closed: !config.cfgOpen.grenadier }"
      data-key="grenadier"
    >
      <label @click="config.toggleCfg('grenadier')">{{ t('cfg.grenadier') }}</label>
      <SegButtons :items="GRENADIER" :current="config.grenadier ?? 'none'" @pick="config.grenadier = $event" />
    </div>

    <div class="cfg-seg" :class="{ closed: !config.cfgOpen.stance }" data-key="stance">
      <label @click="config.toggleCfg('stance')">{{ t('cfg.stance') }}</label>
      <SegButtons :items="STANCES" :current="config.stance" @pick="config.stance = $event" />
    </div>

    <div class="cfg-actions">
      <button class="btn reset" @click="emit('reset')">{{ t('cfg.reset') }}</button>
      <button class="btn compare" @click="emit('compare')">{{ t('cfg.compare') }}</button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.cfg-col {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cfg-sel {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cfg-sel label {
  font-size: 10px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--ink-faint);
}
.cfg-sel select {
  background: #12140d;
  border: 1px solid var(--line);
  color: var(--ink);
  padding: 6px 8px;
  border-radius: var(--radius);
  font-family: "JetBrains Mono";
  font-size: 12px;
}

.cfg-seg {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cfg-seg label {
  font-size: 10px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--ink-faint);
  cursor: pointer;
  user-select: none;
}
.cfg-seg.closed label { color: var(--brass-dim); }
.cfg-seg.closed :deep(.seg) { display: none; }

.cfg-actions { display: flex; gap: 8px; margin-top: 6px; }
.btn {
  flex: 1;
  background: #12140d;
  border: 1px solid var(--line);
  color: var(--ink-dim);
  padding: 7px 10px;
  font-family: "Oswald";
  letter-spacing: .1em;
  text-transform: uppercase;
  font-size: 12px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: .12s;
}
.btn:hover { color: var(--ink); border-color: var(--brass-dim); }
.btn.compare { color: var(--brass); border-color: var(--brass-dim); }
.btn.compare:hover { background: #2a2415; }
</style>
