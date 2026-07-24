<script setup lang="ts">
/**
 * 类别折叠头。对应原 cat-head DOM 节点。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWeaponsStore } from '@/stores/weapons'

const props = defineProps<{
  facKey: string
  catKey: string // i18n key, e.g. 'cat.rifles'
  count: number
}>()

const { t } = useI18n()
const weapons = useWeaponsStore()

const fullKey = computed(() => props.facKey + ':' + props.catKey)
const isOpen = computed(() => weapons.openCat[fullKey.value] ?? false)
const effectivelyOpen = computed(() => isOpen.value || !!weapons.search)

function toggle() {
  weapons.toggleCat(fullKey.value)
}
</script>

<template>
  <div class="cat-head" :class="{ closed: !effectivelyOpen }" @click="toggle">
    <span class="tw">▾</span>{{ t(catKey) }}<span class="cnt">{{ count }}</span>
  </div>
</template>
