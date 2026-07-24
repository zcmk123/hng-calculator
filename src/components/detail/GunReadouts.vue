<script setup lang="ts">
/**
 * Gun 详情读数。对应原 renderGun() 函数。
 * 4 个 SectionGroup（Damage / Armor / Handling / Economy）+ Accuracy & recoil 区块。
 * 末尾的 Accuracy 包含 spread slider + silhouette + recoil。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfigStore } from '@/stores/config'
import { useUiStore } from '@/stores/ui'
import { useSpread } from '@/composables/useSpread'
import { fmt } from '@/lib/format'
import type { Stats } from '@/types/weapon'
import SectionGroup from '@/components/common/SectionGroup.vue'
import StatCell from '@/components/common/StatCell.vue'
import SilhouetteSvg from '@/components/charts/SilhouetteSvg.vue'
import RecoilSvg from '@/components/charts/RecoilSvg.vue'
import CombatCurves from './CombatCurves.vue'

const props = defineProps<{
    stats: Stats
    base: Stats // stock build
}>()

const { t } = useI18n()
const config = useConfigStore()
const ui = useUiStore()

const swayLabel = computed(() => t(`stat.sway`, { stance: t(`stance.${config.stance}`) }))

const spread = useSpread(
    computed(() => props.stats.cone),
    computed(() => ui.spreadRange),
)
const isSpreadClosed = computed(() => ui.isSectionClosed(t('group.accuracy')))
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
                        <StatCell :k="t('stat.rateOfFire')" :v="fmt(stats.rpm)" :unit="t('unit.rpm')" hot
                            :delta="stats.rpm - base.rpm" :better-when-up="true" />
                        <StatCell :k="t('stat.magazine')" :v="stats.mag" :unit="t('unit.rds')" />
                        <StatCell :k="t('stat.reload')" :v="fmt(stats.reload, 2)" :unit="t('unit.s')"
                            :delta="stats.reload - base.reload" :dd="2" :better-when-up="false" />
                        <StatCell :k="t('stat.damage')" :v="`${fmt(stats.dmgNear)} → ${fmt(stats.dmgFar)}`"
                            :unit="t('unit.hp')" hot :delta="stats.dmgNear - base.dmgNear" :better-when-up="true" />
                        <StatCell :k="t('stat.dps')" :v="`${fmt(stats.dpsNear)} → ${fmt(stats.dpsFar)}`"
                            :unit="t('unit.hpPerS')" hot />
                        <StatCell :k="t('stat.htk')" :v="`${stats.htkNear} → ${stats.htkFar}`" kill />
                        <StatCell :k="t('stat.ttk')" :v="`${fmt(stats.ttkNear)} → ${fmt(stats.ttkFar)}`"
                            :unit="t('unit.ms')" kill />
                        <StatCell :k="t('stat.velocity')" :v="fmt(stats.velocity)" :unit="t('unit.mPerS')" />
                        <StatCell :k="t('stat.range')" :v="`${fmt(stats.rNear)} → ${fmt(stats.rFar)}`"
                            :unit="t('unit.m')" />
                        <StatCell :k="t('stat.maxRange')" :v="fmt(stats.rMax)" :unit="t('unit.m')" />
                        <StatCell :k="t('stat.mags')" :v="stats.mags" />
                    </div>
                </SectionGroup>

                <SectionGroup :title="t('group.armor')" :closed="isArmorClosed"
                    @toggle="ui.toggleSection(t('group.armor'))">
                    <div class="grid">
                        <StatCell :k="t('stat.armorDmg')" :v="`${fmt(stats.armorMin)}–${fmt(stats.armorMax)}`"
                            :unit="t('unit.hp')" />
                        <StatCell :k="t('stat.armorDps')" :v="fmt(stats.armorDPS)" :unit="t('unit.hpPerS')" />
                        <StatCell :k="t('stat.armorPen')" :v="`${fmt(stats.penMin, 1)}–${fmt(stats.penMax, 1)}`"
                            :unit="t('unit.mm')" />
                        <StatCell :k="t('stat.armorPenFar')"
                            :v="`${fmt(stats.penFarMin, 1)}–${fmt(stats.penFarMax, 1)}`" :unit="t('unit.mm')" />
                        <StatCell :k="t('stat.penRange')" :v="`${fmt(stats.penNearRange)}–${fmt(stats.penFarRange)}`"
                            :unit="t('unit.m')" />
                    </div>
                </SectionGroup>

                <SectionGroup :title="t('group.handling')" :closed="isHandlingClosed"
                    @toggle="ui.toggleSection(t('group.handling'))">
                    <div class="grid">
                        <StatCell :k="t('stat.cone')" :v="fmt(stats.cone, 3)" :unit="t('unit.deg')" hot
                            :delta="stats.cone - base.cone" :dd="3" :better-when-up="false" />
                        <StatCell :k="t('stat.recoilUp')" :v="fmt(stats.recoilUp, 3)"
                            :delta="stats.recoilUp - base.recoilUp" :dd="3" :better-when-up="false" />
                        <StatCell :k="t('stat.recoilRight')" :v="fmt(stats.recoilRight, 3)"
                            :delta="stats.recoilRight - base.recoilRight" :dd="3" :better-when-up="false" />
                        <StatCell :k="t('stat.recoilSpread')" :v="fmt(stats.recoilVar, 3)"
                            :delta="stats.recoilVar - base.recoilVar" :dd="3" :better-when-up="false" />
                        <StatCell :k="t('stat.bloom')" :v="fmt(stats.bloom, 2)" />
                        <StatCell :k="swayLabel" :v="fmt(stats.sway, 2)" />
                        <StatCell :k="t('stat.swaySpeed')" :v="fmt(stats.swayspeed, 2)" />
                        <StatCell :k="t('stat.swayFatigue')" :v="fmt(stats.swayFatigue, 2)" />
                        <StatCell :k="t('stat.turnPenalty')" :v="fmt(stats.turnPenalty, 2)" />
                        <StatCell :k="t('stat.equipTime')" :v="fmt(stats.equiptime, 2)" :unit="t('unit.s')" />
                    </div>
                </SectionGroup>

                <SectionGroup :title="t('group.economy')" :closed="isEconomyClosed"
                    @toggle="ui.toggleSection(t('group.economy'))">
                    <div class="grid">
                        <StatCell :k="t('stat.costPerShot')" :v="`${fmt(stats.costPerShot, 2)}`"
                            :unit="`${t('unit.cr')} · ${fmt(stats.costPerShotG, 4)} ${t('unit.g')}`" />
                        <StatCell :k="t('stat.costPerMag')" :v="`${fmt(stats.costPerMag, 2)}`"
                            :unit="`${t('unit.cr')} · ${fmt(stats.costPerMagG, 4)} ${t('unit.g')}`" />
                        <StatCell :k="t('stat.costToBuy')" :v="`${fmt(stats.buy)}`"
                            :unit="`${t('unit.cr')} · ${fmt(stats.buyG)} ${t('unit.g')}`" />
                        <StatCell :k="t('stat.ep')" :v="stats.ep" />
                    </div>
                </SectionGroup>
            </div>


            <SectionGroup :title="t('group.accuracy')" :closed="isSpreadClosed"
                @toggle="ui.toggleSection(t('group.accuracy'))">
                <div class="acc-wrap">
                    <div class="spread-readout">
                        <b>{{ spread.deg.toFixed(3) }}°</b> {{ t('stat.cone').toLowerCase() }}
                        &nbsp;·&nbsp; {{ t('spread.at') }} <b>{{ spread.d }} {{ t('unit.m') }}</b> → <b>±{{
                            spread.r.toFixed(3) }} {{ t('unit.m') }}</b>
                        <span class="dim">
                            ({{ spread.cm.toFixed(1) }} {{ t('spread.cmAcross') }}, ≈ {{ spread.pctVsTorso }}% {{
                                t('spread.soldierPct') }})
                        </span>
                    </div>
                    <div class="spread-slider">
                        <span>10 {{ t('unit.m') }}</span>
                        <input class="rng" type="range" min="10" max="600" step="5" :value="ui.spreadRange"
                            @input="ui.setSpreadRange(Number(($event.target as HTMLInputElement).value))" />
                        <span>600 {{ t('unit.m') }}</span>
                    </div>
                    <div class="spread-panes spread-panes-2">
                        <div>
                            <div class="spread-cap">{{ t('spread.vsSoldier') }}</div>
                            <SilhouetteSvg :r="spread.r" :selected="config.hitbox" />
                        </div>
                        <div>
                            <div class="spread-cap">{{ t('spread.recoilPattern') }}</div>
                            <RecoilSvg :stats="stats" :base="base" />
                        </div>
                    </div>
                </div>
            </SectionGroup>
        </div>

        <div class="curves-col">
            <CombatCurves :stats="stats" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.stat-flow {
    column-count: 2;
    column-gap: 16px;
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

.spread-panes-2 {
    grid-template-columns: 1fr 1fr;
}

.spread-cap {
    font-size: 11px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--brass);
    margin-bottom: 4px;
}

@media (max-width: 1180px) {
    .spread-panes-2 {
        grid-template-columns: 1fr;
    }
}
</style>
