/**
 * 计算引擎 — 公式逐行对照 legacy/index.html 的 compute() 函数（第 419-497 行），
 * 数值与原站精确对齐。不要随意改公式。
 */
import type { Cfg, Modifier, Stats, Weapon } from '@/types/weapon'
import { FASTRELOAD, GRENADIER, HEAVYSET, HITBOX, IRONFIST, TARGET_HP } from './constants'

const prod = (arr: number[]): number => arr.reduce((a, b) => a * (b || 1), 1)
const isDefaultAmmo = (w: Weapon, a: { id: number }): boolean => a.id === w.defaultAmmo.id
// 安全数值化：NaN/null/undefined → 0，避免 NaN 传播到 costPerShot 等
const safeNum = (v: unknown): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function compute(w: Weapon, cfg: Cfg): Stats {
  const ammo =
    [w.defaultAmmo, ...(w.ammunition || [])].find((a) => a.id === cfg.ammoId) || w.defaultAmmo
  const mods = (w.modifiers || []).filter((m: Modifier) => cfg.modIds.includes(m.id))
  const f = (key: keyof Modifier): number => prod(mods.map((m) => Number(m[key] ?? 1)))

  // rpm: 防止 recoiltime=0 导致 Infinity，落到 0 而非 Infinity/NaN
  const rt = w.recoiltime * f('fRecoilTime')
  const rpm = rt > 0 ? 60 / rt : 0
  const velocity = ammo.speed * (w.ammoSpeedMod ?? 1)

  // Grenadier badge boosts explosives' player (blast) damage only — not guns.
  const grenMul = [5, 6, 7, 8, 9].includes(w.weaponcategoryid)
    ? (GRENADIER.find((x) => x.id === (cfg.grenadier ?? 'none')) || { mult: 1 }).mult
    : 1
  // damage: floored base (verified: DPS & HTK both use the floored value)
  const dmgNear = Math.floor(ammo.damage * (w.ammoDamageMod ?? 1) * f('fDamage') * grenMul)
  const dmgFar = Math.floor(ammo.damagefar * (w.ammoDamageFarMod ?? 1) * f('fDamageFar') * grenMul)

  const rNear = ammo.rangenear * (w.ammoRangeNearMod ?? 1) * f('fRangeNear')
  const rFar = ammo.rangefar * (w.ammoRangeFarMod ?? 1) * f('fRangeFar')
  const rMax = ammo.rangemax * (w.ammoRangeMaxMod ?? 1)

  // accuracy cone (degrees) — NOT stance-dependent for the base weapon; uses the
  // aim cone modifier from attachments + the ammo cone modifier.
  const cone = w.baseconefire * f('fConeAimModifier') * (ammo.coneModifier ?? 1)

  // recoil — includes ammo.recoilModifier + attachment recoil mods
  const rMul = ammo.recoilModifier ?? 1
  const recoilUp = Math.abs(w.camerarecoilup) * f('fCameraRecoilUp') * rMul
  const recoilRight = Math.abs(w.camerarecoilright) * f('fCameraRecoilRight') * rMul
  const recoilVar = Math.abs(w.camerarecoilvariance) * f('fCameraRecoilVariance') * rMul

  // sway is the stance-dependent part
  const swayMap: Record<string, number> = {
    stand: w.swaystandmode,
    crouch: w.swaycrouchmode,
    prone: w.swaypronemode,
    aim: w.swaystandmode,
  }
  const sway = swayMap[cfg.stance] ?? w.swaystandmode

  const dpsNear = (dmgNear * rpm) / 60
  const dpsFar = (dmgFar * rpm) / 60

  // 非空断言改为兜底，避免脏数据导致 TypeError
  const hb = (HITBOX.find((h) => h.id === cfg.hitbox) || { mult: 1 }).mult
  const hsRaw = (HEAVYSET.find((h) => h.id === cfg.heavyset) || { mult: 1 }).mult
  // headshots bypass Heavy Set armor badge
  const hs = cfg.hitbox === 'head' ? 1 : hsRaw
  const perNear = dmgNear * hb * hs
  const perFar = dmgFar * hb * hs
  // effective per-hit damage & dps against the selected hit location + Heavy Set
  const effNear = perNear, effFar = perFar, effDpsNear = perNear * rpm / 60, effDpsFar = perFar * rpm / 60
  // perNear=0 时 htkNear 会变 Infinity，这里上限为 999 让 UI 可读
  const htkNear = perNear > 0 ? Math.max(1, Math.ceil(TARGET_HP / perNear)) : 999
  const htkFar = perFar > 0 ? Math.max(1, Math.ceil(TARGET_HP / perFar)) : 999
  // rpm=0 时 60/rpm=Infinity，ttk 不应无限放大；这里只有 htk>1 才有意义
  const ttkNear = htkNear > 1 && rpm > 0 ? (htkNear - 1) * (60 / rpm) * 1000 : 0
  const ttkFar = htkFar > 1 && rpm > 0 ? (htkFar - 1) * (60 / rpm) * 1000 : 0

  // armor — guns & AT weapons use the direct fields; mines use the explosion fields
  const aMinRaw = ammo.armorMinDamage || ammo.armorExplosionMinDamage || 0
  const aMaxRaw = ammo.armorMaxDamage || ammo.armorExplosionMaxDamage || 0
  const pMinRaw = ammo.armorMinPenetration || ammo.armorExplosionMinPenetration || 0
  const pMaxRaw = ammo.armorMaxPenetration || ammo.armorExplosionMaxPenetration || 0
  const ironMul = (IRONFIST.find((x) => x.id === (cfg.ironFist ?? 'none')) || { mult: 1 }).mult
  const armorMin = Math.floor(aMinRaw * (w.ammoArmorMinDamageMod ?? 1) * ironMul)
  const armorMax = Math.floor(aMaxRaw * (w.ammoArmorMaxDamageMod ?? 1) * ironMul)
  const penMin = pMinRaw * (w.ammoArmorMinPenetrationMod ?? 1) * 1000 // → mm
  const penMax = pMaxRaw * (w.ammoArmorMaxPenetrationMod ?? 1) * 1000
  const penFarPct = ammo.armorPenetrationFarPercent ?? 0
  const penFarMin = penMin * penFarPct
  const penFarMax = penMax * penFarPct

  const reload = w.reloadtime * (FASTRELOAD.find((x) => x.id === (cfg.fastReload ?? 'none')) || { mult: 1 }).mult
  // sustained armor damage per second: empty a mag then reload
  const avgArmor = (armorMin + armorMax) / 2
  // cycle: rpm=0 时 60/rpm=Infinity，乘以 (clipsize-1) 仍是 Infinity，加 reload 还是 Infinity
  // 用守卫保证 cycle 是有限数；clipsize=1 && reload=0 时 cycle=0 → 回退到爆发 DPS
  const shotDelay = rpm > 0 ? 60 / rpm : 0
  const cycle = (w.clipsize - 1) * shotDelay + reload
  const armorDPS = cycle > 0 ? (w.clipsize * avgArmor) / cycle : (avgArmor * rpm) / 60

  // economy — cost per shot = summed wear cost of weapon + ammo + mods
  // wearCost: Number(undefined)=NaN, NaN ?? 0 仍为 NaN；用 safeNum 兜底
  const wearCost = (o: { wearPerShot?: number; maxCondition?: number }, cur: string): number =>
    ((o.wearPerShot ?? 0) * safeNum((o as Record<string, unknown>)[cur])) / (o.maxCondition || 1)
  const costPerShot =
    wearCost(w, 'maxConditionRepairCredits') +
    wearCost(ammo, 'maxConditionRepairCredits') +
    mods.reduce((s, m) => s + wearCost(m, 'maxConditionRepairCredits'), 0)
  const costPerShotG =
    wearCost(w, 'maxConditionRepairGold') +
    wearCost(ammo, 'maxConditionRepairGold') +
    mods.reduce((s, m) => s + wearCost(m, 'maxConditionRepairGold'), 0)
  const buy =
    w.purchaseCostCredits +
    (isDefaultAmmo(w, ammo) ? 0 : ammo.purchaseCostCredits || 0) +
    mods.reduce((s, m) => s + (m.purchaseCostCredits || 0), 0)
  const buyG =
    w.purchaseCostGold +
    (isDefaultAmmo(w, ammo) ? 0 : ammo.purchaseCostGold || 0) +
    mods.reduce((s, m) => s + (m.purchaseCostGold || 0), 0)

  return {
    ammo,
    mods,
    rpm,
    velocity,
    dmgNear,
    dmgFar,
    rNear,
    rFar,
    rMax,
    cone,
    recoilUp,
    recoilRight,
    recoilVar,
    sway,
    swayspeed: w.swayspeed,
    dpsNear,
    dpsFar,
    effNear,
    effFar,
    effDpsNear,
    effDpsFar,
    htkNear,
    htkFar,
    ttkNear,
    ttkFar,
    equiptime: w.equiptime,
    swayFatigue: w.swayfatigue,
    bloom: w.aimpenaltyperbullet,
    turnPenalty: w.aimpenaltyturn,
    coneRecovery: w.aimpenaltycontractionpersec,
    armorMin,
    armorMax,
    penMin,
    penMax,
    penFarMin,
    penFarMax,
    armorDPS,
    penNearRange: ammo.armorPenetrationNearRange,
    penFarRange: ammo.armorPenetrationFarRange,
    reload,
    mag: w.clipsize,
    mags: w.clipCount,
    ep: w.equipmentPointsCost,
    costPerShot,
    costPerShotG,
    costPerMag: costPerShot * w.clipsize,
    costPerMagG: costPerShotG * w.clipsize,
    buy,
    buyG,
  }
}

/** damage at a given distance — linear interpolation between near and far range */
export function dmgAtRange(s: Stats, d: number): number {
  if (d <= s.rNear) return s.dmgNear
  if (d >= s.rFar) return s.dmgFar
  return s.dmgNear + (s.dmgFar - s.dmgNear) * ((d - s.rNear) / (s.rFar - s.rNear))
}

/** ± metres at distance d for a given cone angle (degrees) */
export const coneRadius = (deg: number, d: number): number =>
  d * Math.tan(((deg / 2) * Math.PI) / 180)

/** "nice" round step for an axis so ticks land on 10/20/50/100 etc. */
export function niceStep(range: number, target: number): number {
  const raw = range / target
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const n = raw / mag
  const s = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10
  return s * mag
}

/** shared cost-per-use helper (wear cost of one use) — used by explosive/equipment readouts */
export function useCost(
  o: { wearPerShot?: number; maxCondition?: number },
  cur: string,
): number {
  const n = Number((o as Record<string, unknown>)[cur])
  return ((o.wearPerShot ?? 0) * (Number.isFinite(n) ? n : 0)) / (o.maxCondition || 1)
}
