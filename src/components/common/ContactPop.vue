<script setup lang="ts">
/**
 * 右上角 Contact & Support 弹层。
 * 对应原 #contactWrap 的逻辑：click outside / Esc 关闭 + 复制 Discord 号。
 */
import { onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const open = ref(false)
const copied = ref(false)
const wrap = ref<HTMLElement | null>(null)

function setOpen(v: boolean) {
  open.value = v
}
function onBtn(e: MouseEvent) {
  e.stopPropagation()
  setOpen(!open.value)
}
function onDocClick(e: MouseEvent) {
  if (wrap.value && !wrap.value.contains(e.target as Node)) setOpen(false)
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') setOpen(false)
}
function onCopy(e: MouseEvent) {
  e.stopPropagation()
  const handle = 'tzm13'
  const done = () => {
    copied.value = true
    setTimeout(() => (copied.value = false), 1200)
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(handle).then(done).catch(done)
  } else {
    done()
  }
}

document.addEventListener('click', onDocClick)
document.addEventListener('keydown', onKey)
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="wrap" class="contact">
    <button
      class="contact-btn"
      :aria-expanded="open ? 'true' : 'false'"
      type="button"
      @click="onBtn"
    >
      {{ t('contact.btn') }}
    </button>
    <div class="contact-pop" :hidden="!open">
      <div class="cp-row">
        <span class="cp-k">{{ t('contact.bugs') }}</span>
        <span class="cp-v">
          {{ t('contact.discord') }}: <b>tzm13</b>
          <button class="cp-copy" type="button" @click="onCopy">
            {{ copied ? t('contact.copied') : t('contact.copy') }}
          </button>
        </span>
      </div>
      <div class="cp-row">
        <span class="cp-k">{{ t('contact.support') }}</span>
        <a
          class="cp-kofi"
          href="https://ko-fi.com/tzm13"
          target="_blank"
          rel="noopener"
        >
          <svg class="kofi-ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5h13v8a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V5z" fill="currentColor" opacity=".9"></path>
            <path d="M17 7h1.6a2.9 2.9 0 0 1 0 5.8H17" fill="none" stroke="currentColor" stroke-width="1.8"></path>
            <path d="M7.4 2.2c-.8.9-.8 1.7 0 2.6M10.6 2.2c-.8.9-.8 1.7 0 2.6M13.8 2.2c-.8.9-.8 1.7 0 2.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".75"></path>
            <rect x="3.4" y="19.4" width="14.2" height="1.9" rx=".95" fill="currentColor" opacity=".9"></rect>
          </svg>
          {{ t('contact.kofi') }}
        </a>
      </div>
      <div class="cp-row cp-author">
        <span class="cp-k">{{ t('contact.originalAuthor') }}</span>
        <span class="cp-v">zewm</span>
      </div>
      <div class="cp-row cp-author">
        <span class="cp-k">{{ t('contact.refurbish') }}</span>
        <span class="cp-v">DoubleBird</span>
      </div>
    </div>
  </div>
</template>
