<script setup lang="ts">
/**
 * 侧栏武器列表项。对应原 wpnItem() 函数。
 * 点击：写入 configStore 默认值（与原 selectWeapon 一致）+ 选中。
 * 路由跳转由父级（若在 table/compare 视图）或 App tab 处理，这里仅触发 selectWeapon。
 */
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useWeaponsStore } from '@/stores/weapons'
import { useConfigStore } from '@/stores/config'
import type { Weapon } from '@/types/weapon'

const props = defineProps<{ weapon: Weapon }>()
const { t } = useI18n()
const weapons = useWeaponsStore()
const config = useConfigStore()
const router = useRouter()

function pick() {
  weapons.selectWeapon(props.weapon.id)
  config.fromWeapon(props.weapon)
  // 若当前不在 detail，跳回 detail（与原 selectWeapon → state.view='detail' 一致）
  if (router.currentRoute.value.path !== '/detail') {
    router.push('/detail')
  }
}
</script>

<template>
  <div
    class="wpn-item"
    :aria-current="weapon.id === weapons.selectedId"
    @click="pick"
  >
    <span>{{ weapon.name }}</span>
    <span class="ep">{{ weapon.equipmentPointsCost }} {{ t('stat.ep') }}</span>
  </div>
</template>
