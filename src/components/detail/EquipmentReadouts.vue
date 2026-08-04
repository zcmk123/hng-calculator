<script setup lang="ts">
/**
 * Equipment（装备：医疗包 / 扳手等）详情读数。对应原 renderEquipment()。
 * 只显示 Item / Economy 两组精简信息。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/ui'
import { fmt } from '@/lib/format'
import { CATEGORIES } from '@/lib/constants'
import { useCost } from '@/lib/compute'
import type { Weapon } from '@/types/weapon'
import SectionGroup from '@/components/common/SectionGroup.vue'
import StatCell from '@/components/common/StatCell.vue'

const props = defineProps<{ weapon: Weapon }>()

const { t } = useI18n()
const ui = useUiStore()

const a = computed(() => props.weapon.defaultAmmo || ({} as Weapon['defaultAmmo']))
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

const typeLabel = computed(() => t(CATEGORIES[props.weapon.weaponcategoryid] || 'cat.equipment'))

// coloured currency helpers — match in-game silver credits / gold
const cr = (n: number | string) => `<span class="cr">${n} cr</span>`
const gd = (n: number | string) => `<span class="gd">${n} g</span>`

const isItemClosed = computed(() => ui.isSectionClosed(t('group.weapon')))
const isEconomyClosed = computed(() => ui.isSectionClosed(t('group.economy')))
</script>

<template>
  <div class="readouts-area">
    <div class="readouts">
      <div class="stat-flow">
        <SectionGroup
          :title="t('group.weapon')"
          :closed="isItemClosed"
          @toggle="ui.toggleSection(t('group.weapon'))"
        >
          <div class="grid">
            <StatCell :k="t('stat.type')" :v="typeLabel" />
            <StatCell v-if="a.damage" :k="t('stat.meleeDamage')" :v="fmt(a.damage)" :unit="t('unit.hp')" />
            <StatCell v-if="a.rangemax" :k="t('stat.rangeReach')" :v="fmt(a.rangemax)" :unit="t('unit.m')" />
            <StatCell :k="t('stat.ep')" :v="weapon.equipmentPointsCost" />
          </div>
        </SectionGroup>

        <SectionGroup
          :title="t('group.economy')"
          :closed="isEconomyClosed"
          @toggle="ui.toggleSection(t('group.economy'))"
        >
          <div class="grid">
            <StatCell
              v-if="costUse > 0"
              :k="t('stat.costPerUse')"
              :v="`${cr(fmt(costUse, 2))} ${gd(fmt(costUseG, 4))}`"
            />
            <StatCell
              v-if="weapon.purchaseCostCredits"
              :k="t('stat.costToBuy')"
              :v="`${cr(fmt(weapon.purchaseCostCredits))} ${gd(fmt(weapon.purchaseCostGold))}`"
            />
            <StatCell v-else :k="t('stat.costToBuy')" :v="t('stat.free')" />
          </div>
        </SectionGroup>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stat-flow { display: flex; flex-direction: column; gap: 14px; }
.grid { display: flex; flex-wrap: wrap; gap: 6px; }
</style>
