<script setup lang="ts">
/**
 * 可折叠分组，对应原 group() / sectionOf() / sectionHead()。
 */
import { computed } from 'vue'

const props = defineProps<{
    title: string
    closed?: boolean
}>()
const emit = defineEmits<{ (e: 'toggle'): void }>()

const cls = computed(() => ({ 'sec-closed': props.closed }))
function onClick() {
    emit('toggle')
}
</script>

<template>
    <div class="stat-group" :class="cls">
        <h3 class="sec-h" @click="onClick">
            <span class="tw">▾</span>{{ title }}
        </h3>
        <div class="sec-body">
            <slot />
        </div>
    </div>
</template>

<style scoped lang="scss">
.stat-group h3.sec-h {
    font-size: 12px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--brass);
    margin: 0 0 7px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
}

.stat-group h3.sec-h::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--line);
}

.stat-group h3.sec-h .tw {
    font-size: 9px;
    color: var(--brass);
    transition: transform .12s;
}

.stat-group.sec-closed h3.sec-h .tw {
    transform: rotate(-90deg);
}

.stat-group.sec-closed .sec-body {
    display: none;
}

.grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.stat-group {
    margin-bottom: 12px;
}
</style>
