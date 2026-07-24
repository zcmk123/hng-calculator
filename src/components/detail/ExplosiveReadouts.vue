<script setup lang="ts">
/**
 * Explosive（爆炸物：地雷 / AT / 手雷）详情读数。对应原 renderExplosive()。
 * Damage / Armor / Handling / Economy 4 组；AT 武器额外加散布图。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfigStore } from '@/stores/config'
import { useUiStore } from '@/stores/ui'
import { useSpread } from '@/composables/useSpread'
import { fmt } from '@/lib/format'
import { FASTRELOAD, GRENADIER, IRONFIST, TARGET_HP } from '@/lib/constants'
import { useCost } from '@/lib/compute'
import type { Weapon } from '@/types/weapon'
import SectionGroup from '@/components/common/SectionGroup.vue'
import StatCell from '@/components/common/StatCell.vue'
import TankSvg from '@/components/charts/TankSvg.vue'
import BlastChart from '@/components/charts/BlastChart.vue'

const props = defineProps<{ weapon: Weapon }>()

const { t } = useI18n()
const config = useConfigStore()
const ui = useUiStore()

const cat = computed(() => props.weapon.weaponcategoryid)
const isAT = computed(() => [7, 8].includes(cat.value))
const isMine = computed(() => [5, 6].includes(cat.value))

const a = computed(() => props.weapon.defaultAmmo || ({} as Weapon['defaultAmmo']))
const thrown = computed(() => (a.value.speed || 0) > 1)

const grenMul = computed(
    () => (GRENADIER.find((x) => x.id === (config.grenadier ?? 'none')) || { mult: 1 }).mult,
)
const ironMul = computed(
    () => (IRONFIST.find((x) => x.id === (config.ironFist ?? 'none')) || { mult: 1 }).mult,
)
const fastReloadMul = computed(
    () => (FASTRELOAD.find((x) => x.id === (config.fastReload ?? 'none')) || { mult: 1 }).mult,
)

const explDmg = computed(() => Math.floor((a.value.explosiondamage || 0) * grenMul.value))
const radius = computed(() => a.value.explosionradius || 0)
const directHit = computed(() => (a.value.damage ? Math.floor(a.value.damage * grenMul.value) : 0))
const killR = computed(() =>
    explDmg.value > TARGET_HP && radius.value > 0
        ? radius.value * (1 - TARGET_HP / explDmg.value)
        : 0,
)

const aMinD = computed(() =>
    Math.floor((a.value.armorExplosionMinDamage || a.value.armorMinDamage || 0) * ironMul.value),
)
const aMaxD = computed(() =>
    Math.floor((a.value.armorExplosionMaxDamage || a.value.armorMaxDamage || 0) * ironMul.value),
)
const pMin = computed(
    () => (a.value.armorExplosionMinPenetration || a.value.armorMinPenetration || 0) * 1000,
)
const pMax = computed(
    () => (a.value.armorExplosionMaxPenetration || a.value.armorMaxPenetration || 0) * 1000,
)
const fuse = computed(() => a.value.explosiontimer || 0)
const reload = computed(() => (props.weapon.reloadtime || 0) * fastReloadMul.value)
const avgArmor = computed(() => (aMinD.value + aMaxD.value) / 2)
const armorDPS = computed(() => (reload.value > 0 ? avgArmor.value / reload.value : 0))
const cone = computed(() => (props.weapon.baseconefire || 0) * (a.value.coneModifier ?? 1))

const costUse = computed(
    () =>
        useCost(a.value, 'maxConditionRepairCredits') +
        useCost(props.weapon, 'maxConditionRepairCredits'),
)
const costUseG = computed(
    () =>
        useCost(a.value, 'maxConditionRepairGold') +
        useCost(props.weapon, 'maxConditionRepairGold'),
)

const typeLabel = computed(() =>
    isMine.value ? t('explosiveType.placed') : a.value.speed > 40 ? t('explosiveType.launched') : t('explosiveType.thrown'),
)

const spread = useSpread(
    computed(() => cone.value),
    computed(() => ui.spreadRange),
)

const isAccuracyClosed = computed(() => ui.isSectionClosed(t('group.accuracy')))
const isDamageClosed = computed(() => ui.isSectionClosed(t('group.damage')))
const isArmorClosed = computed(() => ui.isSectionClosed(t('group.armor')))
const isHandlingClosed = computed(() => ui.isSectionClosed(t('group.handling')))
const isEconomyClosed = computed(() => ui.isSectionClosed(t('group.economy')))
</script>

<template>
    <div class="readouts-area">
        <div class="readouts">
            <div class="stat-flow">
                <SectionGroup :title="t('group.damage')" :closed="isDamageClosed"
                    @toggle="ui.toggleSection(t('group.damage'))">
                    <div class="grid">
                        <StatCell v-if="explDmg" :k="t('stat.explosionDmg')" :v="fmt(explDmg)" :unit="t('unit.hp')" hot />
                        <StatCell v-if="directHit" :k="t('stat.directHit')" :v="fmt(directHit)" :unit="t('unit.hp')" hot />
                        <StatCell v-if="radius" :k="t('stat.killRadius')" :v="fmt(killR, 2)" :unit="t('unit.m')" kill />
                        <StatCell v-if="radius" :k="t('stat.blastRadius')" :v="fmt(radius, 2)" :unit="t('unit.m')" />
                        <StatCell v-if="reload" :k="t('stat.reload')" :v="fmt(reload, 1)" :unit="t('unit.s')" />
                        <StatCell v-if="thrown" :k="t('stat.projectileVelocity')" :v="fmt(a.speed)" :unit="t('unit.mPerS')" />
                        <StatCell v-if="thrown && a.rangemax" :k="t('stat.maxDistance')" :v="fmt(a.rangemax)"
                            :unit="t('unit.m')" />
                        <StatCell v-if="fuse" :k="t('stat.fuseTime')" :v="fmt(fuse, 1)" :unit="t('unit.s')" />
                    </div>
                </SectionGroup>

                <SectionGroup :title="t('group.armor')" :closed="isArmorClosed"
                    @toggle="ui.toggleSection(t('group.armor'))">
                    <div class="grid">
                        <StatCell v-if="aMinD || aMaxD" :k="t('stat.armorDmg')" :v="`${fmt(aMinD)}–${fmt(aMaxD)}`"
                            :unit="t('unit.hp')" hot />
                        <StatCell v-if="armorDPS" :k="t('stat.armorDps')" :v="fmt(armorDPS, 0)" :unit="t('unit.hpPerS')" hot />
                        <StatCell v-if="pMin || pMax" :k="t('stat.armorPen')" :v="`${fmt(pMin, 1)}–${fmt(pMax, 1)}`"
                            :unit="t('unit.mm')" />
                    </div>
                </SectionGroup>

                <SectionGroup :title="t('group.handling')" :closed="isHandlingClosed"
                    @toggle="ui.toggleSection(t('group.handling'))">
                    <div class="grid">
                        <StatCell :k="t('stat.type')" :v="typeLabel" />
                        <StatCell v-if="cone" :k="t('stat.cone')" :v="fmt(cone, 3)" :unit="t('unit.deg')" />
                        <StatCell :k="t('stat.equipTime')" :v="fmt(weapon.equiptime ?? 0, 2)" :unit="t('unit.s')" />
                        <StatCell :k="t('stat.ep')" :v="weapon.equipmentPointsCost" />
                    </div>
                </SectionGroup>

                <SectionGroup :title="t('group.economy')" :closed="isEconomyClosed"
                    @toggle="ui.toggleSection(t('group.economy'))">
                    <div class="grid">
                        <StatCell v-if="costUse > 0" :k="t('stat.costPerUse')" :v="fmt(costUse, 2)"
                            :unit="`${t('unit.cr')} · ${fmt(costUseG, 4)} ${t('unit.g')}`" />
                        <StatCell v-if="weapon.purchaseCostCredits" :k="t('stat.costToBuy')"
                            :v="fmt(weapon.purchaseCostCredits)" :unit="`${t('unit.cr')} · ${fmt(weapon.purchaseCostGold)} ${t('unit.g')}`" />
                        <StatCell v-else :k="t('stat.costToBuy')" :v="t('stat.free')" />
                    </div>
                </SectionGroup>

                <SectionGroup v-if="isAT && cone > 0" :title="t('group.accuracy')" :closed="isAccuracyClosed"
                    @toggle="ui.toggleSection(t('group.accuracy'))">
                    <div class="acc-wrap">
                        <div class="spread-readout">
                            <b>{{ spread.deg.toFixed(3) }}°</b> {{ t('stat.cone').toLowerCase() }}
                            &nbsp;·&nbsp; {{ t('spread.at') }} <b>{{ spread.d }} {{ t('unit.m') }}</b> → <b>±{{ spread.r.toFixed(3) }} {{ t('unit.m') }}</b>
                            <span class="dim">
                                ({{ spread.cm.toFixed(1) }} {{ t('spread.cmAcross') }}, ≈ {{ spread.pctVsStuart }}% {{ t('spread.tankPct') }})
                            </span>
                        </div>
                        <div class="spread-slider">
                            <span>10 {{ t('unit.m') }}</span>
                            <input class="rng" type="range" min="10" max="600" step="5" :value="ui.spreadRange"
                                @input="ui.setSpreadRange(Number(($event.target as HTMLInputElement).value))" />
                            <span>600 {{ t('unit.m') }}</span>
                        </div>
                        <div class="spread-panes spread-panes-1">
                            <div>
                                <div class="spread-cap">{{ t('spread.vsTank') }}</div>
                                <TankSvg :r="spread.r" />
                            </div>
                        </div>
                    </div>
                </SectionGroup>
            </div>
        </div>

        <div v-if="explDmg && radius" class="curves-col">
            <BlastChart :expl-dmg="explDmg" :radius="radius" :kill-r="killR" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.stat-flow {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.acc-wrap {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 12px 12px 5px;
}

.spread-readout {
    font-family: "JetBrains Mono";
    font-size: 12px;
    color: var(--ink-dim);
}

.spread-readout b {
    color: var(--ink);
}

.spread-readout .dim {
    color: var(--ink-faint);
}

.spread-slider {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--ink-faint);
}

.spread-panes {
    display: grid;
    gap: 12px;
}

.spread-panes-1 {
    grid-template-columns: 1fr;
}

.spread-cap {
    font-size: 11px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--brass);
    margin-bottom: 4px;
}
</style>
