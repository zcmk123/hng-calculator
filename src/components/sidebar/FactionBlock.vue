<script setup lang="ts">
/**
 * 单个阵营块：阵营头 + cat-head 子分组（Misc 为 flat 列表）。
 * 对应原 factionBlock() 函数。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWeaponsStore, type GroupedFac } from '@/stores/weapons'
import CatHead from './CatHead.vue'
import WeaponItem from './WeaponItem.vue'

const props = defineProps<{ fac: GroupedFac }>()
const { t } = useI18n()
const weapons = useWeaponsStore()

const facKey = computed(() => props.fac.facKey)
const isOpen = computed(() => weapons.openFac[facKey.value] ?? false)

function toggleFac() {
  weapons.toggleFac(facKey.value)
}

// searching 时强制展开，便于查看所有匹配
const effectivelyOpen = computed(() => isOpen.value || !!weapons.search)
</script>

<template>
  <div>
    <div
      class="faction-head"
      :class="{ closed: !effectivelyOpen }"
      @click="toggleFac"
    >
      <span class="tw">▾</span>
      <span class="chip" :style="{ background: fac.facColor }"></span>
      {{ t(fac.facNameKey) }}
    </div>

    <template v-if="effectivelyOpen">
      <!-- Misc: flat list -->
      <template v-if="fac.flatItems">
        <WeaponItem
          v-for="w in fac.flatItems"
          :key="w.id"
          :weapon="w"
        />
      </template>

      <!-- real factions: nested categories -->
      <template v-else>
        <div
          v-for="cat in fac.cats"
          :key="cat.cat"
        >
          <CatHead :fac-key="facKey" :cat-key="cat.cat" :count="cat.items.length" />
          <template v-if="weapons.openCat[facKey + ':' + cat.cat] || weapons.search">
            <WeaponItem
              v-for="w in cat.items"
              :key="w.id"
              :weapon="w"
            />
          </template>
        </div>
      </template>
    </template>
  </div>
</template>
