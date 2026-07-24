<script setup lang="ts">
/**
 * 通用 badge（阵营 / 类别 / 火控模式 / EP）。
 */
defineProps<{
  text: string
  faction?: boolean
  color?: string
}>()
</script>

<template>
  <span class="badge" :class="{ faction }" :style="faction && color ? { color } : undefined">
    {{ text }}
  </span>
</template>
