<script setup lang="ts">
/**
 * 数据面板视图：sheet-head + ConfigPanel + readouts。
 * 对应原 renderDetail() + renderReadouts()。
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useWeaponsStore } from '@/stores/weapons'
import { useConfigStore } from '@/stores/config'
import { useVersusStore } from '@/stores/versus'
import { useCompute } from '@/composables/useCompute'
import { FACTIONS, CATEGORIES } from '@/lib/constants'
import { itemKind } from '@/lib/classify'
import Badge from '@/components/common/Badge.vue'
import ConfigPanel from './ConfigPanel.vue'
import GunReadouts from './GunReadouts.vue'
import ExplosiveReadouts from './ExplosiveReadouts.vue'
import EquipmentReadouts from './EquipmentReadouts.vue'

const { t } = useI18n()
const weapons = useWeaponsStore()
const config = useConfigStore()
const versus = useVersusStore()
const router = useRouter()

const w = computed(() => weapons.selectedWeapon)

const facMeta = computed(
  () => FACTIONS[w.value.factiontemplateid] || { name: '?', color: '#888' },
)
const catLabel = computed(
  () => t(CATEGORIES[w.value.weaponcategoryid] || 'cat.unknown'),
)
const fireMode = computed(() =>
  w.value.fireModeAuto
    ? w.value.fireModeSingle
      ? t('fireMode.select')
      : t('fireMode.auto')
    : t('fireMode.semi'),
)

const kind = computed(() => itemKind(w.value))

const cfg = computed(() => config.asCfg())
const stats = useCompute(w, cfg)

const stockCfg = computed(() => ({
  ammoId: w.value.defaultAmmo.id,
  modIds: [] as number[],
  hitbox: config.hitbox,
  heavyset: config.heavyset,
  fastReload: config.fastReload,
  ironFist: config.ironFist,
  grenadier: config.grenadier,
  stance: config.stance,
}))
const stockStats = useCompute(w, stockCfg)

// 武器图片：public/weapons/{id}.png，切换武器时重置错误状态
const imgOk = ref(true)
const weaponImg = computed(() => {
  if (!imgOk.value) return ''
  return `${import.meta.env.BASE_URL}weapons/${w.value.id}.png`
})
watch(() => w.value.id, () => { imgOk.value = true })
function onImgError() { imgOk.value = false }

function onCompare() {
  versus.setEntry(0, w.value.id)
  versus.setEntryAmmo(0, config.ammoId)
  versus.setEntryMods(0, config.modIds)
  router.push('/compare')
}
</script>

<template>
  <div>
    <header class="sheet-head">
      <div>
        <img
          v-if="weaponImg"
          :src="weaponImg"
          :alt="w.name"
          class="weapon-thumb"
          @error="onImgError"
        />
        <div class="name">{{ w.name }}</div>
        <div class="meta">
          <Badge :text="t(facMeta.name)" faction :color="facMeta.color" />
          <Badge :text="catLabel" />
          <Badge :text="fireMode" />
          <Badge :text="`${w.equipmentPointsCost} ${t('stat.ep')}`" />
        </div>
      </div>
    </header>

    <div class="layout">
      <ConfigPanel :weapon="w" @reset="config.reset(w)" @compare="onCompare" />

      <div v-if="stats && stockStats">
        <GunReadouts v-if="kind === 'gun'" :stats="stats" :base="stockStats" />
        <ExplosiveReadouts v-else-if="kind === 'explosive'" :weapon="w" />
        <EquipmentReadouts v-else :weapon="w" />
      </div>
    </div>
  </div>
</template>
