<script setup lang="ts">
/**
 * 根组件：顶栏 + 侧栏 + <router-view>。
 * 对应原 .app / .topbar / .sidebar / .main 结构。
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useWeaponsStore } from '@/stores/weapons'
import { toggleLocale } from '@/i18n'
import WeaponSidebar from '@/components/sidebar/WeaponSidebar.vue'
import ContactPop from '@/components/common/ContactPop.vue'

const { t } = useI18n()
const route = useRoute()
const weapons = useWeaponsStore()

const buildTag = computed(() => `${weapons.all.length} ${t('build.loaded')}`)

const tabs = [
  { to: '/detail', key: 'tabs.detail' },
  { to: '/table', key: 'tabs.table' },
  { to: '/compare', key: 'tabs.compare' },
]
const isActive = (to: string) => route.path === to
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <span class="stencil">{{ t('app.title') }}</span>
        <span class="tag">{{ t('app.tagline') }}</span>
      </div>
      <nav class="tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.to"
          role="tab"
          :aria-selected="isActive(tab.to) ? 'true' : 'false'"
          @click="$router.push(tab.to)"
        >
          {{ t(tab.key) }}
        </button>
      </nav>
      <span class="build mono">{{ buildTag }}</span>
      <button class="lang-switch" type="button" @click="toggleLocale">
        {{ t('lang.switch') }}
      </button>
      <ContactPop />
    </header>

    <WeaponSidebar />

    <main class="main">
      <router-view />
    </main>
  </div>
</template>
