/**
 * 静态常量表。label 字段一律使用 i18n key（如 'cat.rifles'），由组件用 $t() 翻译。
 * 数字 ID 与原站完全一致，保证数据兼容。
 */
import type { BadgeOption, Faction, HitboxOption, StanceOption } from '@/types/weapon'

export const FACTIONS: Record<number, Faction> = {
  1: { name: 'faction.us', color: '#a8b061' },     // United States
  2: { name: 'faction.ger', color: '#7f95a3' },    // Germany
  3: { name: 'faction.sov', color: '#c05a45' },    // Soviet Union
  0: { name: 'faction.misc', color: '#8f8a6f' },   // Shared / Other
}

/** weaponcategoryid → i18n key（保留原 ID 顺序，但合并展示用 CAT_MERGE） */
export const CATEGORIES: Record<number, string> = {
  11: 'cat.semiRifles',
  12: 'cat.boltRifles',
  13: 'cat.assaultRifles',
  14: 'cat.lmg',
  16: 'cat.smg',
  17: 'cat.handguns',
  4: 'cat.equipment',
  5: 'cat.apMines',
  6: 'cat.atMines',
  7: 'cat.atWeapons',
  8: 'cat.rocketLaunchers',
  9: 'cat.grenades',
}

export const MOD_CATEGORIES: Record<number, string> = {
  2: 'cfg.barrel',
  3: 'cfg.bolt',
  4: 'cfg.sight',
  5: 'cfg.trigger',
}

// display order matching the in-game modification screen: Ammo (rendered first,
// separately), then Sight, Trigger, Bolt/Spring, Barrel.
export const MOD_ORDER = [4, 5, 3, 2]

export const HITBOX: HitboxOption[] = [
  { id: 'torso', labelKey: 'hitbox.torso', mult: 1.0 },
  { id: 'head', labelKey: 'hitbox.head', mult: 3.56 },
  { id: 'legs', labelKey: 'hitbox.legs', mult: 0.8 },
  { id: 'arms', labelKey: 'hitbox.arms', mult: 0.5 },
]

export const HEAVYSET: BadgeOption[] = [
  { id: 'none', labelKey: 'badge.none', mult: 1.0 },
  { id: 'bronze', labelKey: 'badge.bronze', mult: 0.95 },
  { id: 'silver', labelKey: 'badge.silver', mult: 0.9 },
  { id: 'gold', labelKey: 'badge.gold', mult: 0.85 },
]

// Fast Reload badge: cuts reload time
export const FASTRELOAD: BadgeOption[] = [
  { id: 'none', labelKey: 'badge.none', mult: 1.0 },
  { id: 'bronze', labelKey: 'badge.bronze', mult: 0.82 },
  { id: 'silver', labelKey: 'badge.silver', mult: 0.7 },
  { id: 'gold', labelKey: 'badge.gold', mult: 0.57 },
]

// Infantry / Iron Fist badge: boosts armor damage
export const IRONFIST: BadgeOption[] = [
  { id: 'none', labelKey: 'badge.none', mult: 1.0 },
  { id: 'bronze', labelKey: 'badge.bronze', mult: 1.13 },
  { id: 'silver', labelKey: 'badge.silver', mult: 1.19 },
  { id: 'gold', labelKey: 'badge.gold', mult: 1.25 },
]

// Grenadier badge: boosts explosives' player (blast) damage
export const GRENADIER: BadgeOption[] = [
  { id: 'none', labelKey: 'badge.none', mult: 1.0 },
  { id: 'bronze', labelKey: 'badge.bronze', mult: 1.08 },
  { id: 'silver', labelKey: 'badge.silver', mult: 1.11 },
  { id: 'gold', labelKey: 'badge.gold', mult: 1.15 },
]

export const STANCES: StanceOption[] = [
  { id: 'stand', labelKey: 'stance.stand' },
  { id: 'crouch', labelKey: 'stance.crouch' },
  { id: 'prone', labelKey: 'stance.prone' },
]

export const TARGET_HP = 100

// merged sidebar categories: several raw weaponcategoryids fold into one display group.
export const CAT_MERGE: Record<number, { label: string; order: number }> = {
  11: { label: 'cat.rifles', order: 1 },
  12: { label: 'cat.rifles', order: 1 },
  13: { label: 'cat.rifles', order: 1 },
  16: { label: 'cat.smg', order: 2 },
  14: { label: 'cat.lmg', order: 3 },
  17: { label: 'cat.handguns', order: 4 },
  7: { label: 'cat.at', order: 5 },
  8: { label: 'cat.at', order: 5 },
  5: { label: 'cat.mines', order: 6 },
  6: { label: 'cat.mines', order: 6 },
  9: { label: 'cat.grenades', order: 7 },
}

export const GUN_CATS = [11, 12, 13, 14, 16, 17]
export const EXPLOSIVE_CATS = [5, 6, 7, 8, 9]

// 对比页配色
export const VS_PALETTE = ['#c9a24b', '#c85a3f', '#7f95a3']

// Hitbox 颜色（用于剪影 SVG）
export const HB_COLOR: Record<string, string> = {
  head: '#d24b34',
  torso: '#c9a24b',
  legs: '#8a9a56',
  arms: '#5f6350',
}
