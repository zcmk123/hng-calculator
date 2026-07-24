/**
 * UI store：散布距离、stat-group 折叠、表格排序。
 * view tab 由 vue-router 同步，不在此处管理。
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SortState } from '@/types/weapon'

export const useUiStore = defineStore('ui', () => {
  const spreadRange = ref<number>(100)
  const secClosed = ref<Record<string, boolean>>({})
  const sort = ref<SortState>({ key: 'name', dir: 1 })

  function setSpreadRange(v: number) {
    spreadRange.value = v
  }
  function toggleSection(title: string) {
    secClosed.value = { ...secClosed.value, [title]: !secClosed.value[title] }
  }
  function isSectionClosed(title: string): boolean {
    return !!secClosed.value[title]
  }
  function setSort(key: string, num: boolean | undefined) {
    if (sort.value.key === key) {
      sort.value = { key, dir: -sort.value.dir }
    } else {
      sort.value = { key, dir: num === false ? 1 : -1 }
    }
  }

  return {
    spreadRange,
    secClosed,
    sort,
    setSpreadRange,
    toggleSection,
    isSectionClosed,
    setSort,
  }
})
