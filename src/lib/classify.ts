/**
 * 武器分类与侧栏分组辅助。
 */
import type { ItemKind, Weapon } from '@/types/weapon'
import { CAT_MERGE, CATEGORIES, EXPLOSIVE_CATS, GUN_CATS } from './constants'

export function itemKind(w: Weapon): ItemKind {
  if (GUN_CATS.includes(w.weaponcategoryid)) return 'gun'
  if (EXPLOSIVE_CATS.includes(w.weaponcategoryid)) return 'explosive'
  return 'equipment' // cat 4 (medkits, wrench, etc.)
}

/** merged category label key for any item — returns i18n key, not localized string */
export function catName(w: Weapon): string {
  if (w.factiontemplateid === 0 || w.weaponcategoryid === 4) return 'cat.misc'
  return (CAT_MERGE[w.weaponcategoryid] || {}).label || CATEGORIES[w.weaponcategoryid] || 'cat.unknown'
}

export interface GroupRef {
  fac: string
  cat: string | null
}

/** which sidebar group an item belongs to. Misc = shared/other faction + all equipment. */
export function groupOf(w: Weapon): GroupRef {
  if (w.factiontemplateid === 0 || w.weaponcategoryid === 4) return { fac: 'misc', cat: null }
  return { fac: String(w.factiontemplateid), cat: catName(w) }
}
