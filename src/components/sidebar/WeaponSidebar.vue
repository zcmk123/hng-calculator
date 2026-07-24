<script setup lang="ts">
/**
 * 武器侧栏：搜索 + 阵营分组列表。对应原 buildSidebar()。
 */
import { useI18n } from 'vue-i18n'
import { useWeaponsStore } from '@/stores/weapons'
import FactionBlock from './FactionBlock.vue'

const { t } = useI18n()
const weapons = useWeaponsStore()
</script>

<template>
  <aside class="sidebar">
    <div class="search">
      <input
        :value="weapons.search"
        :placeholder="t('search.placeholder')"
        autocomplete="off"
        @input="weapons.setSearch(($event.target as HTMLInputElement).value)"
      />
    </div>
    <div>
      <FactionBlock
        v-for="fac in weapons.groupedWeapons"
        :key="fac.facKey"
        :fac="fac"
      />
    </div>
  </aside>
</template>
